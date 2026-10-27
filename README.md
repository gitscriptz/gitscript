# GitScript

Files: `index.html`, `styles.css`, `app.js`, and `functions/api/[[path]].js` (the backend).

## Deploy on Cloudflare Pages (real accounts + shared network)
1. Push this folder to a GitHub repo, then Cloudflare dashboard > Workers & Pages > Create > Pages > connect the repo. No build command; output directory is `/`.
2. Create a KV namespace: Storage & Databases > KV > Create (name it `gitscript`).
3. Open your Pages project > Settings > Bindings > Add > KV namespace. Variable name must be exactly `GS`; pick the namespace.
4. Redeploy. Click the Offline pill in the app, then create an account on the Network tab.

Without the backend (local file, GitHub Pages) the editor still works fully offline; Online mode shows why it can’t connect.
