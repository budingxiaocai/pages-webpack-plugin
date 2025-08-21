const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');
const EntryPlugin = require('webpack/lib/EntryPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class PagesPlugin {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        const options = this.options;

        const scanDir =
            (typeof options.scanDir === 'string' && options.scanDir) ||
            path.join(compiler.context, 'src');
        delete options.scanDir;

        const entryName =
            (typeof options.entryName === 'string' && options.entryName) ||
            'index.{vue,tsx,jsx,html}';
        delete options.entryName;

        // 伪静态
        let htaccess = `location / {
    try_files $uri $uri.html =404;
}`;

        const pageDirs = glob.sync('**', {
            onlyDirectories: true,
            absolute: true,
            nocase: true,
            cwd: scanDir
        });

        pageDirs.forEach((dir) => {
            let currentEntryName;
            let currentWebpackOptions;

            if (fs.existsSync(path.join(dir, '.pagerc.json'))) {
                // 获取单个目录的配置
                const { entryName, options } = JSON.parse(
                    fs.readFileSync(path.join(dir, '.pagerc.json'), 'utf-8')
                );

                if (typeof entryName === 'string' && entryName !== '') currentEntryName = entryName;

                currentWebpackOptions = options;
            }

            const entryFile = glob.sync(currentEntryName || entryName, {
                absolute: true,
                nocase: true,
                cwd: dir
            });

            if (entryFile.length !== 1) return;

            let pageName = path.basename(dir);
            let pagePath =
                path.dirname(path.relative(scanDir, dir).split(path.sep).join('/')) + '/';

            if (pageName.startsWith('[') && pageName.endsWith(']')) {
                pageName = '@' + pageName.slice(1, -1) + '@';

                htaccess += '\r\n\r\n';
                htaccess += `location ~ ^/${pagePath}([^/]+)/?$ {
    rewrite ^/${pagePath}([^/]+)/?$ /${pagePath}${pageName}.html?${pageName.slice(1, -1)}=$1 break;
}`;
            }

            if (pagePath === './') pagePath = '';

            new EntryPlugin(compiler.context, entryFile[0], pageName).apply(compiler);
            new HtmlWebpackPlugin(
                Object.assign(
                    {
                        chunks: [pageName],
                        filename: pagePath + pageName + '.html'
                    },
                    currentWebpackOptions,
                    options
                )
            ).apply(compiler);
        });

        compiler.hooks.afterEmit.tapAsync('PagesPlugin', (compilation, callback) => {
            fs.writeFileSync(
                path.join(compilation.outputOptions.path, '.htaccess'),
                htaccess,
                'utf-8'
            );
            callback();
        });
    }
}

module.exports = PagesPlugin;
