# Deploying Road Trip 2026 to Cloudflare Pages

This guide walks through the full path from this local project to a live public site using:

- **GitHub** for source control
- **Cloudflare Pages** for hosting

This is the recommended setup for this project because it is:

- a **static Astro site**
- low traffic
- cheap to host
- simple to maintain

For this site, Cloudflare Pages should be **free** on the normal free tier.

---

## 1. What this guide assumes

This project is already in good shape for Cloudflare Pages:

- Framework: **Astro**
- Build command: `npm run build`
- Output directory: `dist`
- It does **not** need a server or database
- It already has local Git initialized
- Current branch is **`main`**

That means deployment is straightforward.

---

## 2. Before you start

You will need:

- a **GitHub account**
- a **Cloudflare account**
- access to this local project folder:
  - `/home/pat/projects/roadtrip2026`

Optional but useful:

- a domain name, if you want something nicer than `*.pages.dev`

---

## 3. Pre-flight local check

Open a terminal and run:

```bash
cd /home/pat/projects/roadtrip2026
npm ci
npm run build
```

What to expect:

- `npm ci` installs dependencies from `package-lock.json`
- `npm run build` should produce a fresh `dist/` folder

If build succeeds, the site is ready to deploy.

---

## 4. Create the GitHub repository

This local project already has Git initialized, so the next step is to create an **empty GitHub repo** and connect it.

### 4.1 Create a new repo on GitHub

1. Log into GitHub.
2. Click the **+** in the upper-right corner.
3. Choose **New repository**.
4. Pick a repository name.
   - Example: `roadtrip2026`
5. Choose visibility:
   - **Private** if you do not want the code publicly visible
   - **Public** if you do not care and want the repo itself public
6. **Important:** leave these unchecked:
   - Add a README
   - Add `.gitignore`
   - Choose a license

Why leave them unchecked:
- this local repo already exists
- creating files in the GitHub repo can create an unnecessary first-merge conflict

7. Click **Create repository**.

After GitHub creates it, leave that page open. GitHub will show the repo URL.

---

## 5. Connect this local repo to GitHub

### 5.1 Check current repo status

Run:

```bash
cd /home/pat/projects/roadtrip2026
git status
```

If you have local changes you want included in the first push, commit them first.

### 5.2 Commit local changes if needed

If `git status` shows modified or untracked files you want in GitHub, run:

```bash
git add .
git commit -m "Prepare site for Cloudflare Pages deployment"
```

If Git says there is nothing to commit, that is fine.

### 5.3 Add the GitHub remote

Use the HTTPS URL from GitHub. It will look like this:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/roadtrip2026.git
```

Example:

```bash
git remote add origin https://github.com/pat-example/roadtrip2026.git
```

### 5.4 Push the repo to GitHub

Run:

```bash
git push -u origin main
```

Notes:

- GitHub no longer accepts your normal account password for Git over HTTPS.
- If prompted for credentials, use either:
  - a **personal access token (PAT)**, or
  - GitHub login through your credential helper if already configured

If push succeeds, refresh the GitHub repo page and confirm your files are there.

---

## 6. If GitHub asks for a personal access token

If you are prompted for a password and it does not work, create a PAT.

### 6.1 Create a GitHub token

1. In GitHub, click your profile picture.
2. Go to **Settings**.
3. Go to **Developer settings**.
4. Go to **Personal access tokens**.
5. Choose **Tokens (classic)** or **Fine-grained tokens**.
   - Fine-grained is more modern.
6. Create a token with repo access sufficient to push to your new repo.
7. Copy the token somewhere safe temporarily.

### 6.2 Use the token when pushing

When Git prompts for:

- **username**: your GitHub username
- **password**: paste the token, not your normal GitHub password

---

## 7. Deploy the repo to Cloudflare Pages

### 7.1 Sign into Cloudflare

1. Go to <https://dash.cloudflare.com>
2. Sign in or create an account
3. Verify your email if Cloudflare asks

### 7.2 Open Pages

1. In the Cloudflare dashboard, go to:
   - **Workers & Pages**
2. Click **Create application**
3. Choose **Pages**
4. Choose **Connect to Git**

### 7.3 Connect Cloudflare to GitHub

1. Cloudflare will ask to connect to GitHub
2. Authorize the Cloudflare Pages GitHub app
3. You may be asked whether to allow all repos or selected repos
   - safest choice: **selected repos only**
   - then choose `roadtrip2026`

### 7.4 Select the repo

1. In Cloudflare Pages, find your repo
2. Select `roadtrip2026`
3. Click **Begin setup**

---

## 8. Cloudflare Pages build settings for this project

Use these exact settings:

- **Project name:** `roadtrip2026` or any name you prefer
- **Production branch:** `main`
- **Framework preset:** `Astro`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** leave blank
- **Environment variables:** none needed

Then click:

- **Save and Deploy**

Cloudflare will pull the repo, install dependencies, build the site, and publish it.

---

## 9. First live URL

After deployment finishes, Cloudflare will give you a URL like:

```text
https://roadtrip2026.pages.dev
```

Open that URL and test:

- home page
- `/days/`
- `/charging/`
- `/map/`
- a few day detail pages

Examples:

- `https://roadtrip2026.pages.dev/`
- `https://roadtrip2026.pages.dev/days/`
- `https://roadtrip2026.pages.dev/map/`

---

## 10. How updates work after deployment

Once GitHub and Cloudflare Pages are connected, updates are simple.

### 10.1 Make your local changes

Edit the project locally.

### 10.2 Test locally

```bash
cd /home/pat/projects/roadtrip2026
npm run build
```

### 10.3 Commit and push

```bash
git add .
git commit -m "Update site content/layout"
git push
```

Cloudflare Pages will automatically:

- detect the push
- start a new build
- publish the updated site

No manual upload needed.

---

## 11. Optional: use a custom domain later

You do **not** need this for the first deployment.
Start with `pages.dev`, make sure everything works, then add a domain if you want.

Examples:

- `trip.yourdomain.com`
- `route66.yourdomain.com`

### 11.1 Add the custom domain in Cloudflare Pages

1. Open your Pages project
2. Go to **Custom domains**
3. Click **Set up a custom domain**
4. Enter the domain or subdomain
5. Follow the DNS instructions Cloudflare shows

### 11.2 If your DNS is already on Cloudflare

This is the easiest case. Cloudflare can usually set up the records automatically.

### 11.3 If your domain is at another registrar

You can still use Cloudflare Pages. You may need to:

- add a `CNAME` record at your registrar or DNS provider
- or move DNS to Cloudflare later if you want everything in one place

---

## 12. Optional: restrict access later

If you later decide the site should not be fully open to the public, Cloudflare has a good path for that.

Look into:

- **Cloudflare Zero Trust Access**

That can restrict access by:

- email allowlist
- one-time login
- identity provider

For now, the simplest first step is to deploy publicly and decide later whether access control is needed.

---

## 13. Troubleshooting

## Problem: `git push` fails because the remote already has files

This usually happens if you created the GitHub repo with a README or license.

Fix options:

### Easiest fix
Delete the GitHub repo and create a new empty one with:

- no README
- no `.gitignore`
- no license

### Alternative fix
Pull and merge, but for a brand-new repo this is more annoying than it is worth.

---

## Problem: GitHub asks for a password and rejects it

Use a **personal access token**, not your GitHub account password.

---

## Problem: Cloudflare cannot see the GitHub repo

Try:

1. Re-check GitHub app authorization
2. Make sure the repo is in the account/org Cloudflare was authorized for
3. Re-run the GitHub connection flow in Cloudflare

---

## Problem: Cloudflare build fails

Open the deployment logs in Cloudflare Pages and check:

- dependency install step
- build step
- whether `npm run build` failed

Also test locally:

```bash
cd /home/pat/projects/roadtrip2026
npm ci
npm run build
```

If local build fails, fix that first.

---

## Problem: site loads but some pages or assets 404

For this project, root deployment on Cloudflare Pages is the correct choice.

That means:

- output directory should be `dist`
- root directory should be blank
- do not deploy under a subpath

Cloudflare Pages serves this well because this site uses root-based links like:

- `/days/`
- `/map/`
- `/charging/`

---

## 14. Recommended first deployment path

Use this exact order:

1. Build locally
2. Create empty GitHub repo
3. Push local repo to GitHub
4. Connect GitHub repo to Cloudflare Pages
5. Use `main` as production branch
6. Set build command to `npm run build`
7. Set output directory to `dist`
8. Deploy
9. Review the live `pages.dev` URL
10. Add custom domain only after you are happy

---

## 15. Quick command reference

### Local build

```bash
cd /home/pat/projects/roadtrip2026
npm ci
npm run build
```

### Commit and push first time

```bash
cd /home/pat/projects/roadtrip2026
git status
git add .
git commit -m "Prepare site for Cloudflare Pages deployment"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/roadtrip2026.git
git push -u origin main
```

### Later updates

```bash
cd /home/pat/projects/roadtrip2026
npm run build
git add .
git commit -m "Update site"
git push
```

---

## 16. Notes specific to this project

- This site is static, so Cloudflare Pages is a strong fit.
- There is no need for a VPS.
- There is no need for a database or server process.
- There are no required environment variables right now.
- The simplest and cheapest production path is:
  - **GitHub + Cloudflare Pages**

---

## 17. Suggested next step after reviewing this doc

Follow these in order:

1. Create the empty GitHub repo
2. Push this local repo
3. Create the Cloudflare Pages project
4. Do the first live deploy to `pages.dev`

Once that is working, decide whether you want:

- a custom domain
- access restriction
- or to leave it on the default Cloudflare URL
