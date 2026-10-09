# Deployment: free hosting on a Hugging Face Space

The app runs as a Docker Space (free CPU) built from the repo `Dockerfile`. A GitHub Actions
workflow (`.github/workflows/deploy-hf-space.yml`) stages the needed files with
`scripts/stage_hf_space.sh` and uploads them with `huggingface_hub`.

The workflow runs on pushes to `main` that touch app files, and manually via
"Run workflow". If the repo variable `HF_SPACE_ID` (or the secret `HF_TOKEN`) is not set, the
deploy job prints a message and finishes successfully without deploying, so CI never goes red.

## Owner steps

1. Create a free account at https://huggingface.co and create an access token with **write**
   permission (Settings -> Access Tokens).
2. Decide the Space id as `<hf-user>/<space-name>` (the workflow creates the Space if missing).
3. Store the token and Space id in GitHub:

   ```bash
   gh secret set HF_TOKEN --repo Alishnis/nasaspace-app
   gh variable set HF_SPACE_ID --repo Alishnis/nasaspace-app --body <hf-user>/<space-name>
   ```

   (`gh secret set` prompts for the value; do not paste it into commands, files or chat.)
4. In the Space: Settings -> Variables and secrets, add the secrets listed below.
5. Run the workflow once: Actions -> "Deploy to Hugging Face Space" -> Run workflow (or push to `main`).
6. When the Space is up, put its URL (`https://<hf-user>-<space-name>.hf.space`) in the README
   in place of the `TODO(owner)` live-demo placeholder.

To preview what gets uploaded: `bash scripts/stage_hf_space.sh` (writes `build/hf-space/`, git-ignored).

## Space secrets

All are optional; names only (never commit values). Defaults come from `.env.example`.

| Name | Purpose |
|---|---|
| `JWT_SECRET` | Signs login tokens. Strongly recommended. If unset, a random secret is generated at each start and all tokens become invalid after a restart. |
| `EMAIL_USER`, `EMAIL_PASS` | Nodemailer credentials for the welcome email. If empty, emails are only logged. |
| `EMAIL_SERVICE`, `EMAIL_HOST`, `EMAIL_PORT` | Mail provider settings (default service: gmail). Not secret; may be Space variables. |
| `TEMPO_API_KEY`, `TEMPO_API_URL` | Read by the code but not used yet (data is simulated). |
| `WEATHER_API_KEY` | Read by the code but not used yet (data is simulated). |
| `REDIS_HOST`, `REDIS_PORT` | Not needed: with no Redis the app uses an in-memory cache. |

The app does not read any VAPID/push or encryption keys. `PORT` is set to 3003 by the Dockerfile
and matches `app_port` in the Space README.

## Limitations of the free tier

- **State resets on restart.** Users, subscriptions and the cache live in process memory (the code
  has no database and writes no files), and the Space filesystem is ephemeral with no persistent
  disk on the free tier. Accounts and subscriptions are therefore lost whenever the Space restarts,
  which is acceptable for a demo.
- **Cold starts.** A free Space sleeps after roughly 48 hours without traffic and wakes on the next
  visit, which takes about a minute.
- The Space runs the container as UID 1000. Because the app writes no files, no data directory or
  extra permissions are needed. The staged Dockerfile starts `node server.js` directly (same as
  `npm start`) so it does not depend on a writable home directory. Hugging Face ignores the
  Dockerfile `HEALTHCHECK`; it still works for local Docker/Compose.

## Legacy

`docker-compose.yml` and the Azure-era setup are kept for reference. The previous Azure deployment
(`nasaspace-app-tmpalish.azurewebsites.net`) ran on student credit that has run out; do not assume it is live.
