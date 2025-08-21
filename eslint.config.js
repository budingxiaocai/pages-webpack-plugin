const js = require('@eslint/js');
const globals = require('globals');

const { FlatCompat } = require('@eslint/eslintrc');
const { defineConfig } = require('eslint/config');
const { fixupConfigRules } = require('@eslint/compat');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },

            ecmaVersion: 'latest',
            sourceType: 'module'
        },

        extends: fixupConfigRules(
            compat.extends('eslint:recommended', 'plugin:prettier/recommended')
        )
    }
]);
