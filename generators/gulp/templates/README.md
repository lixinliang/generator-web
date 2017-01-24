# templates-gulp
> Templates of web generator.

## Generator

* [generator-web](https://github.com/lixinliang/generator-web)

## Role

* Gulp
    * Watch files.
* Rollup
    * Rollup handles `.js` files.
* Postcss
    * Postcss handles `.css` files.

## Usage

* `$ yo web`

## Directory Tree

`tree -I node_modules`

```
.
├── CHANGELOG.md
├── LICENSE
├── README.md
├── gulpfile.js
├── package.json
└── src
    ├── _index.html
    ├── css
    │   ├── base
    │   │   ├── base.css
    │   │   └── normalize.css
    │   └── index.css
    ├── img
    └── js
        └── index.js
```

## Cli

* dev: `$ npm run dev`
* build: `$ npm run build`
* dist: `$ npm run dist`

## License

MIT
