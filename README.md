# generator-web

> A simple webpack generator

## 简单、粗暴的web脚手架

### Install

* Clone or download.
* `$ cd generator-web`
* `$ npm install`
* `$ npm link`

### Use

* `$ yo web`
* Follow the guide.
* You got this:

```
├── package.json
├── src
│   ├── _index.html
│   └── entry
│       ├── img
│       ├── index.js
│       ├── modules
│       └── sass
│           ├── base
│           │   ├── _base.scss
│           │   ├── _flexible.scss
│           │   ├── _normalize.scss
│           │   ├── _orientation.scss
│           │   └── _tool.scss
│           └── index.scss
└── webpack
    ├── webpack.build.js
    ├── webpack.dev.js
    ├── webpack.entry.json
    ├── webpack.node.js
    └── webpack.profile.js
```

### Develop

* `$ npm run dev`

### Release

* `$ npm run build`

### Feature

* Can update `webpack` or `src` directory when it is exist already;

* If the port is eaddrinuse, there is a prompt to help you to kill it;

* Use `$ npm run build js` to pack a single js file which is a subfile of `entry` directory;

* Create webpack entry dynamically;

* Use `process.env.NODE_ENV === 'production'` to mark codes effect in production only.

* According to `package.json`, replace `@NAME` or `@VERSION` to correct value.

* Include the file which is require with `inline` attribute in HTML.

* Put these comments in the top of the js file, then you use `$ npm run build js`, that it will follow those rule to pack.
```
/**
 * @webpack
 * @library example
 * @libraryTarget umd
 */
```

## License

MIT
