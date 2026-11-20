// Version 8. No cookies, browser storage or analytics by default.
const legacyRoutes = {"about": "about.html", "research": "research.html", "publications": "publications.html", "experience": "experience.html", "awards": "experience.html#awards", "teaching": "teaching.html", "reading": "reading.html", "blog": "/blog/", "contact": "contact.html"};
if(document.body.dataset.page==='home' && legacyRoutes[location.hash.slice(1)]) location.replace(legacyRoutes[location.hash.slice(1)]);
const year=document.getElementById('year'); if(year)year.textContent=new Date().getFullYear();
const printButton=document.getElementById('printCV');
if(printButton)printButton.addEventListener('click',()=>window.print());
let closedDetails=[];
window.addEventListener('beforeprint',()=>{closedDetails=[...document.querySelectorAll('details:not([open])')];closedDetails.forEach(d=>d.open=true)});
window.addEventListener('afterprint',()=>closedDetails.forEach(d=>d.open=false));
for(const button of document.querySelectorAll('.load-reading'))button.addEventListener('click',()=>{const template=button.nextElementSibling;template.after(template.content.cloneNode(true));button.remove();template.remove();});
// Optional Google Scholar CSV import. Upload scholar.csv to the repository root.
// No direct Google Scholar API calls; the existing publications remain the fallback.
async function loadScholar(doc = document) {
  function parseCSV(text) {
    const rows=[]; let row=[], value='', quoted=false;
    text=text.replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"') { if(quoted && text[i+1]==='"'){value+='"';i++;} else quoted=!quoted; }
      else if(c===',' && !quoted){row.push(value);value='';}
      else if((c==='\r'||c==='\n') && !quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);rows.push(row);row=[];value='';}
      else value+=c;
    }
    if(value||row.length){row.push(value);rows.push(row);}
    if(quoted)throw Error('Invalid CSV');
    return rows;
  }
  const original=doc.getElementById('journal-original'), target=doc.getElementById('scholar-import');
  if(!original || !target) return;
  const normalize=x=>x.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const known=new Map([...original.querySelectorAll('.pub')].map(c=>[normalize(c.querySelector('h3').textContent),c]));
  const node=(tag,text,cls)=>{const e=doc.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  try {
    const response=await fetch('scholar.csv',{cache:'no-cache'});if(!response.ok)return;
    const rows=parseCSV(await response.text());if(rows.length<2)return;
    const headers=rows.shift().map(x=>x.trim().toLowerCase());
    if(!headers.includes('title'))return;
    const records=rows.map(row=>Object.fromEntries(headers.map((k,i)=>[k,(row[i]||'').trim()]))).filter(r=>r.title);
    if(!records.length)return;
    records.sort((a,b)=>(parseInt(b.year)||0)-(parseInt(a.year)||0));
    const fragment=doc.createDocumentFragment(), seen=new Set();
    for(const r of records){
      const key=normalize(r.title);if(seen.has(key))continue;seen.add(key);
      const card=node('article','','pub'), info=node('div'), old=known.get(key);
      card.append(node('div',r.year||old?.querySelector('.year')?.textContent||'—','year'),info);
      info.append(node('h3',r.title),node('p',r.authors||r.author||''));
      const journal=[r.publication||r.journal||r.booktitle,r.volume,r.number?'('+r.number+')':'',r.pages].filter(Boolean).join(' · ');
      info.append(node('p',journal||old?.querySelector('.journal')?.textContent||r.publisher||'','journal'));
      const badge=old?.querySelector('.badge');if(badge)info.append(badge.cloneNode(true));
      const a=node('a','Find paper ↗','link-btn');a.target='_blank';a.rel='noopener noreferrer';
      let doi=(r.doi||'').replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,'').trim();
      if(/^10\.\d{4,9}\/\S+$/i.test(doi)){a.href='https://doi.org/'+doi;a.textContent='Read paper ↗';}
      else if(old?.querySelector('a.link-btn')){a.href=old.querySelector('a.link-btn').getAttribute('href');a.textContent='Read paper ↗';}
      else a.href='https://scholar.google.com/scholar?q='+encodeURIComponent(r.title);
      card.append(a);fragment.append(card);
    }
    target.replaceChildren(fragment);target.hidden=false;original.hidden=true;
    doc.getElementById('journal-heading').textContent='Selected publications';doc.getElementById('scholar-note').hidden=false;
  } catch(e) { /* Keep existing articles if a file is missing or malformed. */ }
}


// Refresh the printable profile from the current dedicated pages when online.
async function refreshPrintProfile(){
 if(document.body.dataset.page!=='profile'||location.protocol==='file:')return;
 const files=['about.html','research.html','publications.html','experience.html','teaching.html','contact.html'];
 await Promise.all(files.map(async file=>{try{const r=await fetch(file,{cache:'no-cache'});if(!r.ok)return;const doc=new DOMParser().parseFromString(await r.text(),'text/html');for(const sec of doc.querySelectorAll('main > section')){const old=document.getElementById(sec.id);if(old)old.replaceWith(document.importNode(sec,true));}}catch(e){/* use the supplied snapshot if offline */}}));
}
const scholarReady=refreshPrintProfile().then(()=>loadScholar());
function revealTarget(){const id=location.hash.slice(1);if(!id)return;const el=document.getElementById(id);if(!el)return;for(let n=el;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;el.scrollIntoView({block:'start'});}
scholarReady.then(revealTarget);
window.addEventListener('hashchange',revealTarget);
// Search across academic pages and essay archive, loading only same-origin files on request.
(() => {
 const dialog=document.getElementById('siteSearch'); if(!dialog)return;
 const input=document.getElementById('searchInput'),results=document.getElementById('searchResults'),status=document.getElementById('searchStatus');
 const pages=['index.html','about.html','research.html','publications.html','experience.html','teaching.html','reading.html','contact.html','/blog/'];
 const norm=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
 function clean(el){const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT),p=[];while(w.nextNode()){if(!w.currentNode.parentElement?.closest('[hidden],script,style,template'))p.push(w.currentNode.nodeValue.trim());}return p.filter(Boolean).join(' ').replace(/\s+/g,' ').trim();}
 function collect(doc,path){const entries=[];const main=doc.querySelector('main');if(!main)return entries;
 for(const sec of main.querySelectorAll('section')){
  if(sec.closest('[hidden]'))continue;const title=clean(sec.querySelector('h1,h2,h3')||sec);const body=clean(sec);if(!body)continue;
  entries.push({title,body,group:'Page',url:path+(sec.id?'#'+sec.id:'')});
  for(const el of sec.querySelectorAll('article,details,.award,.tags')){if(el.closest('section')!==sec||el.closest('[hidden]'))continue;const heading=el.querySelector('h2,h3,summary');const b=clean(el);if(!b)continue;const essay=el.matches('.entry')?el.querySelector('h2 a'):null;entries.push({title:heading?clean(heading):'Research methods',body:el.dataset.search||b,group:title,url:essay?essay.getAttribute('href'):path+'#'+(el.id||sec.id||'')});}
 }return entries;}
 let all=null, misses=0, generation=0;
 async function index(){await scholarReady;return (await Promise.all(pages.map(async path=>{try{const url=new URL(path,location.href);const same=url.pathname===location.pathname||(path==='index.html'&&location.pathname.endsWith('/'));if(same)return collect(document,path);const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error();const doc=new DOMParser().parseFromString(await r.text(),'text/html');if(path==='publications.html')await loadScholar(doc);return collect(doc,path);}catch(e){misses++;return [];}}))).flat();}
 async function search(){const mine=++generation;const terms=norm(input.value).split(' ').filter(Boolean);results.replaceChildren();if(!terms.length){status.textContent='Enter a keyword to search the academic website.';return;}status.textContent='Searching website pages…';const entries=await (all||(all=index()));if(mine!==generation)return;
 const matches=entries.filter(e=>terms.every(t=>norm(e.title+' '+e.group+' '+e.body).includes(t))).map(e=>({...e,score:terms.reduce((v,t)=>v+(norm(e.title).includes(t)?4:0)+(norm(e.body).includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score);
 status.textContent=(matches.length?`${matches.length} result${matches.length===1?'':'s'}`:'No results. Try another keyword.')+(misses?' Some pages could not be loaded.':'');
 matches.slice(0,60).forEach(e=>{const li=document.createElement('li'),a=document.createElement('a'),title=document.createElement('strong'),desc=document.createElement('small');a.className='search-result';a.href=e.url;title.textContent=e.title;const i=norm(e.body).indexOf(terms[0]),start=Math.max(0,i-40);desc.textContent=e.group+' · '+(start?'…':'')+e.body.slice(start,start+150)+(e.body.length>start+150?'…':'');a.append(title,desc);li.append(a);results.append(li);a.addEventListener('click',()=>dialog.close());});}
 document.getElementById('searchOpen').addEventListener('click',()=>{dialog.showModal();input.focus();});document.getElementById('searchClose').addEventListener('click',()=>dialog.close());input.addEventListener('input',search);
})();
// VISITS: replace YOUR_GOATCOUNTER_CODE with the code selected when signing up.
// Example: if the dashboard is example.goatcounter.com, use example.
(() => {
  const code = 'YOUR_GOATCOUNTER_CODE';
  const label = document.getElementById('visitCount');
  if (!label || !/^[a-z0-9-]+$/i.test(code)) return;
  if (!/^https?:$/.test(location.protocol)) {label.textContent='Online only';return;}
  const base = 'https://' + code + '.goatcounter.com';
  label.textContent='Loading…';
  const tracker=document.createElement('script');tracker.async=true;
  tracker.dataset.goatcounter=base+'/count';tracker.src='https://gc.zgo.at/count.js';document.head.append(tracker);
  fetch(base+'/counter/TOTAL.json').then(r=>{if(!r.ok)throw Error('Counter unavailable');return r.json();})
    .then(data=>{label.textContent=data.count ?? 'Unavailable';})
    .catch(()=>{label.textContent='Unavailable';});
})();
