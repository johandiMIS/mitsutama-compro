# Deployment

Reference notes for deploying an app (frontend + API) behind nginx on an Ubuntu server, with
Let's Encrypt SSL via certbot. Written to be reused across projects — replace the placeholders
below with the real values for the app being deployed.

**Placeholders used throughout:**

| Placeholder      | Meaning                              | Example (this repo)   |
| ----------------- | ------------------------------------ | ---------------------- |
| `<app>`            | Short app/client slug for filenames  | `compro`                |
| `<client-domain>`  | Public domain for the frontend       | `compro.example.com`    |
| `<api-domain>`     | Public domain for the API            | `api.compro.example.com`|
| `<client-port>`    | Local port the frontend listens on   | `3006`                  |
| `<api-port>`       | Local port the API listens on        | `3007`                  |
| `<app-root>`        | Repo path on the server              | `/var/www/compro`       |

## 1. Process management (PM2)

> Superseded approach: earlier deploys used one `server`/`client` checkout per app with generic
> pm2 names (`nest-server`, `next-client`). Now that apps live together in a turborepo monorepo
> with per-app custom ports, run one pm2 process per app instead, named after the app and started
> from its own folder under `apps/`.

### 1.1 Build

```bash
cd <app-root>
pnpm build
```

(`pnpm build:wsl` instead, if turbo is blocked natively on the host — see the repo's `CLAUDE.md`.)

### 1.2 Start each app under PM2

```bash
cd <app-root>/apps/<api-app>
pm2 start "node dist/main" --name <app>-api

cd <app-root>/apps/<web-app>
pm2 start "npm run start" --name <app>-web
```

- Confirm the actual compiled entry point under `dist/` before wiring the command — NestJS's
  build output lands at `dist/main.js` or `dist/src/main.js` depending on `tsconfig.json`'s
  `rootDir`/`outDir`, so check rather than assume.
- Each app must already be configured to listen on its own port (`<client-port>` / `<api-port>`
  — see section 2, and matches what nginx proxies to in section 3); pm2 only supervises the
  process, it doesn't set the port.
- Name each pm2 process after the app (e.g. `<app>-api`, `<app>-web`) so multiple apps on the
  same host stay distinguishable in `pm2 list`/`pm2 logs`.

### 1.3 Persist across reboots

```bash
pm2 save
pm2 startup systemd
```

Run once per server. `pm2 startup systemd` prints a `sudo env PATH=... pm2 startup ...` command —
copy and run that separately; it registers pm2 as a systemd service so `pm2 save`d processes come
back after a reboot.

## 2. Port setting

Each app's port is configured in its own repo, not by pm2 — pm2 just runs the start command that
was already configured to listen on the right port.

### apps/api

- Reads `PORT` from the environment (`apps/api/src/main.ts`), falling back to `3007` if unset.
- Set `PORT=<api-port>` in `apps/api/.env` (copy from `.env.example`) before starting it with pm2.
- `main.ts` also reads `WEB_ORIGIN` for CORS (defaults to `http://localhost:3006`) — set it to
  the deployed `<client-domain>` (with protocol), or the frontend's requests will be rejected.

### apps/web

- Port is hardcoded into the `dev`/`start` scripts in `apps/web/package.json`
  (`next start -p 3006`), not read from an env var.
- To change it, edit the `-p <port>` flag in that script directly, or override it at the pm2
  command instead: `pm2 start "npm run start -- -p <client-port>" --name <app>-web`.

Whichever ports are set here are what `<client-port>` / `<api-port>` refer to throughout the rest
of this doc — they must match the `proxy_pass` targets in the nginx site configs (section 3).

## 3. Nginx setup

### 3.1 Install nginx

Run as the `ubuntu` user (default on most Ubuntu server images — run `exit` first if you've
switched to another user).

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### 3.2 Add a shared reverse-proxy snippet

Create a reusable snippet with the common proxy headers, so each site config only needs a
`proxy_pass` line plus this include.

```bash
sudo nano /etc/nginx/snippets/node-proxy.conf
```

```nginx
proxy_http_version 1.1;
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# WebSocket upgrade
proxy_set_header Upgrade    $http_upgrade;
proxy_set_header Connection "upgrade";

# Timeouts (tune as needed)
proxy_connect_timeout 5s;
proxy_send_timeout    60s;
proxy_read_timeout    60s;

# Increase if you upload big files
client_max_body_size 25m;
```

Validate and reload after any nginx config change:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 Add the site config for the frontend

```bash
sudo nano /etc/nginx/sites-available/<app>-client.conf
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name <client-domain>;

    location / {
        proxy_pass http://127.0.0.1:<client-port>;
        include /etc/nginx/snippets/node-proxy.conf;
    }
}
```

Enable the site by symlinking it into `sites-enabled`:

```bash
sudo ln -s /etc/nginx/sites-available/<app>-client.conf /etc/nginx/sites-enabled/<app>-client.conf
```

### 3.4 Add the site config for the API

```bash
sudo nano /etc/nginx/sites-available/<app>-server.conf
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name <api-domain>;

    location / {
        proxy_pass http://127.0.0.1:<api-port>;
        include /etc/nginx/snippets/node-proxy.conf;
    }
}
```

Enable it the same way:

```bash
sudo ln -s /etc/nginx/sites-available/<app>-server.conf /etc/nginx/sites-enabled/<app>-server.conf
```

Then validate and reload nginx again (see 3.2).

### 3.5 SSL (Let's Encrypt via certbot)

```bash
sudo apt install -y snapd
sudo snap install core && sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

certbot --nginx

sudo nginx -t && sudo systemctl reload nginx
```

`certbot --nginx` prompts for which of the configured `server_name`s to issue certs for, and
rewrites the matching site configs in `sites-available` to add the `listen 443 ssl` block and
HTTP→HTTPS redirect automatically.

## 4. How to use this guide with an AI assistant

Sections 1–3 are reference, written with placeholders so they're reusable. Rather than
copy-pasting from them by hand, ask an AI assistant (Claude Code or similar, with this file in
context) to do it:

> Read `docs/deployment.md`. Ask me for values for every placeholder in it (`<app>`,
> `<client-domain>`, `<api-domain>`, `<client-port>`, `<api-port>`, `<app-root>`, plus the
> `apps/` folder names and the two nginx `sites-available` filenames). Then write
> `deploy-commands.md` in the repo root: a Markdown file with one fenced code block per command
> group from sections 1–3, placeholders substituted with my answers, ordered so the blocks
> actually run correctly if pasted top to bottom — that means port setting before pm2 start, and
> any `nano <file>` / "content:" pairs rewritten as non-interactive
> `sudo tee <file> > /dev/null <<'EOF' ... EOF` heredocs instead of an interactive editor. Label
> each block with which guide section it came from.

The assistant should treat the resulting file as disposable output, not something to hand-edit
or commit — it embeds real domains/paths for one specific deploy (see the `deploy-commands.md`
entry in `.gitignore`). Copy each block by hand into an SSH session on the VPS as you go — that's
the point of generating Markdown instead of a runnable script: you read and paste one step at a
time rather than executing it unattended. Ask again whenever the values change (new domain,
different app slug, redeploying a second app on the same box) to regenerate it.
