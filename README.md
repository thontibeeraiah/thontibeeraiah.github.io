# Thonti Beeraiah — academic website

This is a self-contained, responsive website. No paid hosting, dependencies, databases, build tools, or command line required.

## Publish for free using GitHub Pages

1. Open `index.html` in your browser to preview the site.
2. Sign in to GitHub and open https://github.com/new.
3. Set repository name to `thontibeeraiah.github.io` (under your account `thontibeeraiah`). Choose **Public**, then create the repository. If it already exists, use the existing repository instead and back up any existing site before replacing files.
4. On the repository's Code page, use **Add file → Upload files** (in an empty repo, click the link to upload an existing file). Upload `index.html` itself, not the ZIP or containing folder. Optionally upload this README and `.nojekyll`. Commit the changes to the `main` branch.
5. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and click Save.
6. After GitHub completes deployment, open https://thontibeeraiah.github.io/. The Pages settings tab will show the deployment URL/status. If there is an error, check the Actions tab and that index.html is at the root.
7. Optional: in your GitHub profile's Edit profile settings, put the website URL in the Website field.

Official guides: https://docs.github.com/en/pages/quickstart and https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Update your website

In your repository, open `index.html`, click the pencil (Edit), make a change, and click **Commit changes**. GitHub Pages will republish it automatically. You can also edit your local copy with any text editor, upload it again, and commit. Keep the file named `index.html`.

- The content is all plain HTML. Sections have comments to help locate them. Search for a phrase you want to change, such as `Doctoral researcher` or `Dec 2026 (expected)`.
- Update the PhD dates/status and affiliation when appropriate. The current site reflects the supplied November 2026 resume rather than independently verified current details.
- Add a publication by copying an existing `<article class="pub"> ... </article>` and changing its year, title, authors, journal and DOI URL.
- Style settings are in the `:root` rule near the top of the file. No external fonts, frameworks or analytics are used.
- To add your photo later, upload a photo named `profile.jpg` next to index.html. Insert `<img src="profile.jpg" alt="Thonti Beeraiah" width="150" height="150" style="object-fit:cover;border-radius:50%;margin-bottom:18px">` before the hero heading if desired; no photo was included in the resume.
- The Print / save academic profile button opens the browser print dialog. Select Save as PDF to export the public academic profile (not the original resume).

## Public information review before publishing

This site is based on the supplied resume. It includes your professional contact email, publication links, education (including CGPAs), awards, research, teaching and sports interests. It leaves out your phone number, referee details, student names, and manuscripts under review. The original PDF 
is not bundled. The illustration is synthetic, not research data. Review the public content and change or remove anything you prefer not to disclose. Published GitHub Pages sites are publicly accessible. External profile/DOI URLs come directly from the resume; their destinations have not been 
independently verified.
