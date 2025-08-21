# PagesPlugin
PagesPlugin 是一个用于自动化多页面应用构建的 Webpack 插件，专为扫描目录结构并动态生成入口和 HTML 文件而设计。它支持灵活配置、伪静态路由生成，并与 .pagerc.json 配置文件集成，实现每个页面的个性化构建。

## 特性
- 零配置：按目录名即可生成页面
- 动态路由：`[id]` 目录自动映射为 `/@id@.html?id=`
- 单页配置：`.pagerc.json` 可对单个页面做个性化设置
- 伪静态：通过`.htaccess`文件将`/hello`映射为`/hello.html`

## 安装
```bash
npm i -D pages-webpack-plugin
# 或
yarn add -D pages-webpack-plugin
```

## 快速开始
1. 在项目根目录新建 webpack.config.js：
```javascript
const PagesPlugin = require('pages-plugin-webpack');

module.exports = {
  // ...
  plugins: [
    new PagesPlugin({
      scanDir: './src/pages',        // 可选，默认为 src
      entryName: 'index.{tsx,jsx}'   // 可选，默认为 index.{vue,tsx,jsx,html}
      // 其余与html-webpack-plugin字段相同
    })
  ]
};
```

2. 新建目录结构
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

3. 运行 `yarn build`，即可得到：
- `home.html`
- `about.html`
- `user/@id@.html`（实际访问为 `/user/[id]`）

## 目录约定
| 目录名示例       | 生成路由            | 说明            |
| ----------- | --------------- | ------------- |
| `home`      | `/home.html`    | 普通静态页         |
| `[id]`      | `/@id@.html?id=`     | 动态路由（参数为 `id`） |

## 配置项
插件实例化时可传入：
| 字段          | 类型       | 默认值                        | 描述            |
| ----------- | -------- | -------------------------- | ------------- |
| `scanDir`   | `string` | `src`                      | 扫描页面根目录       |
| `entryName` | `string` | `index.{vue,tsx,jsx,html}` | 入口文件名 glob 规则 |

以及[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options)中的所有字段

## 单页配置 `.pagerc.json`
在任意页面目录下创建 `.pagerc.json`，可覆盖全局设置（`scanDir` 除外）：
```json
{
  "entryName": "main.tsx"
  // 其余与html-webpack-plugin字段相同
}
```

## 动态路由（伪静态）

### 静态页面映射
通过 `.htaccess` Nginx伪静态文件将 `/user` 的请求内部重定向至 `/user.html`
```
location / {
    try_files $uri $uri.html =404;
}
```

### 动态路由
- 目录名使用 `[]` 包裹，如 `[id]`、`[slug]`
- 构建后生成：`/user/@id@.html`
- 自动生成 `.htaccess` Nginx伪静态文件
```
location ~ ^/user/([^/]+)/?$ {
    rewrite ^/user/([^/]+)/?$ /user/@id@.html?id=$1 break;
}
```
