# npm-link-save

[![npm](https://img.shields.io/npm/v/npm-save-ensured.svg?style=flat-square)](https://www.npmjs.com/package/npm-save-ensured)

ensure dependency is saved in `package.json` when call `npm link` or `npm install --link`

## Install

```
npm i -g npm-save-ensured
```

## Usage

```
npm-save-ensured/npm-save/npms install --link express
npm-save-ensured/npm-save/npms link express
npms i -D express     // links in devDependencies
npms link express morgan // multiple links
```
