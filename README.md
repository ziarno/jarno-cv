# jarno-cv

Filip Jarno's CV as a single static page, implemented from a
[Claude Design](https://claude.ai/design) mockup.

No build step. `site/` **is** the deployable artifact — edit the files, ship the
directory.

```
site/
  index.html    content + structure (the CV itself lives here, as HTML)
  styles.css    all styling; values carried over from the design source
  app.js        behaviour only — the page is fully readable without it
  assets/       portrait, company logos, favicon
Dockerfile      nginx:alpine + site/
nginx.conf      server config (mounted as the default site)
compose.yaml    single-service deployment
```

## Editing the CV

Content is plain HTML in [`site/index.html`](site/index.html). Roles live in the
`<ol class="timeline">` blocks; the stack pills live in the STACK section. There
is no data file and no generator to re-run.

## Local preview

Any static server works:

```bash
python3 -m http.server 4321 --directory site
```

## Docker

```bash
docker compose up -d --build
```

Serves on `127.0.0.1:8080` (loopback only — see the note in
[`compose.yaml`](compose.yaml)). The container runs read-only with
`no-new-privileges`, nginx listens on 8080 as an unprivileged worker, and
`/healthz` returns `ok` for the healthcheck and any upstream proxy.

Put a TLS-terminating reverse proxy (Caddy, Traefik, nginx) in front of it on the
server. That deployment step is not covered here.

## Notes

- **Theme.** Dark by default, toggle top-right, choice persisted in
  `localStorage` under `cv-theme`. An inline script in `<head>` applies the
  stored theme before first paint so there's no flash of the wrong one.
- **Third-party assets.** Fonts come from Google Fonts; tech logos from
  simpleicons/devicon; `particles.js` from cdnjs. Every logo has a built-in
  letter-tile fallback if the request fails, so the page degrades cleanly — but
  a fully self-contained deployment would need these vendored locally.
- **Progressive enhancement.** All content is in the HTML. With JS off you lose
  the particles, scroll reveals, card tilt, glitch effect, and theme toggle;
  the CV itself still reads fine.
- `prefers-reduced-motion` disables particles, reveals, tilt, and the glitch.
- A print stylesheet drops the decorative layers.
- The Claude Design handoff bundle is gitignored (`/design-src`); its assets are
  already copied into `site/assets/`.
