# PagesPlugin

[中文](https://github.com/budingxiaocai/pages-webpack-plugin/blob/master/README-CN.md)

PagesPlugin is a Webpack plugin that automates multi-page application builds. It scans directory structures and dynamically generates entry points and HTML files. It supports flexible configuration, pseudo-static routing, and integrates with `.pagerc.json` for per-page customization.

## Features
- Zero-config: Pages are generated automatically from directory names
- Dynamic routes: Directories named `[id]` are mapped to `/@id@.html?id=`
- Per-page config: `.pagerc.json` overrides global settings for a single page
- Pseudo-static: `.htaccess` rewrites `/hello` internally to `/hello.html`

## Install
```bash
npm i -D pages-webpack-plugin
# or
yarn add -D pages-webpack-plugin
```

## Quick Start
1. Create `webpack.config.js` in the project root:
```javascript
const PagesPlugin = require('pages-plugin-webpack');

module.exports = {
  // ...
  plugins: [
    new PagesPlugin({
      scanDir: './src/pages',        // optional, defaults to src
      entryName: 'index.{tsx,jsx}'   // optional, defaults to index.{vue,tsx,jsx,html}
      // any other html-webpack-plugin options are allowed
    })
  ]
};
```

2. Create the following directory structure:
```
src/pages/
├── home/
│   └── index.tsx
├── about/
│   └── index.jsx
└── user/
    └── [id]/
        └── index.tsx
```

3. Run `yarn build` to obtain:
- `home.html`
- `about.html`
- `user/@id@.html` (accessible at `/user/[id]`)

## Directory Conventions
| Directory example       | 	Generated route            | Description            |
| ----------- | --------------- | ------------- |
| `home`      | `/home.html`    | Static page         |
| `[id]`      | `/@id@.html?id=`     | Dynamic route (param `id`) |

## Plugin Options
You can pass the following fields when instantiating the plugin:
| Field          | Type       | 	Default                        | 	Description            |
| ----------- | -------- | -------------------------- | ------------- |
| `scanDir`   | `string` | `src`                      | Root directory to scan pages       |
| `entryName` | `string` | `index.{vue,tsx,jsx,html}` | Entry filename glob pattern |

Any option supported by [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options) is also accepted.

## Per-Page Config: `.pagerc.json`
Place `.pagerc.json` inside any page directory to override global settings (except scanDir):
```json
{
  "entryName": "main.tsx"
  // any other html-webpack-plugin options
}
```

## Dynamic Routes (Pseudo-Static)

### Static page mapping
Use an `.htaccess` or Nginx snippet to internally rewrite `/user` to `/user.html`:
```
location / {
    try_files $uri $uri.html =404;
}
```

### Dynamic routes
- Wrap directory names with `[]`, e.g. `[id]`, `[slug]`
- The build outputs: `/user/@id@.html`
- A matching `.htaccess` / Nginx snippet is auto-generated:
```
location ~ ^/user/([^/]+)/?$ {
    rewrite ^/user/([^/]+)/?$ /user/@id@.html?id=$1 break;
}
```
