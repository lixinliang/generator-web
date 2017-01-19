[![bitHound Overall Score](https://www.bithound.io/github/lixinliang/generator-web/badges/score.svg)](https://www.bithound.io/github/lixinliang/generator-web)
[![bitHound Dependencies](https://www.bithound.io/github/lixinliang/generator-web/badges/dependencies.svg)](https://www.bithound.io/github/lixinliang/generator-web/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/lixinliang/generator-web/badges/code.svg)](https://www.bithound.io/github/lixinliang/generator-web)

# generator-web
> 🎉A simple web generator.

## 简单、粗暴的web脚手架，易扩展。

### Env

* Node - v4.7.0
* npm - 2.15.11

### Installation

* Clone or download.
* `$ cd generator-web`
* `$ npm install`
    * If install fail, please try again later.

### Usage

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
    └── webpack.node.js
```

### Develop

* `$ npm run dev`

### Release

* `$ npm run build`

### Dist

* `$ npm run dist`
* Dependency : `http-server`

### Custom

* `$ open generators/app/templates/package.json`
* Custom your `package.json`, such as change the author.

### Supported

* `html`
* `css`
* `js`
* `scss`
* `vue`
* `coffee`

### Feature

**-`yo web`-**

* Exec `$ yo web` and the default project name is your directory name;

* Exec `$ yo web` again in the initialized directory can restore `webpack` or `src` directory or `package.json` file;

* Now, you can choose `Link to the shared node_modules` or `Install node_modules` in generating stage;

* `shared node_modules` means that all project will share a same node_modules, and they both link to `generator-web/generators/app/templates/node_modules`;

**-`npm run dev`-**

* Create webpack entry dynamically, depend on the js file in `entry` directory;

* If the net port is EADDRINUSE, when you exec `$ npm run dev` there is a prompt to help you to kill it;

* According the content in `package.json`, replace `process.env.NAME` or `process.env.VERSION` to correct value, in `js` file;

**-`npm run build`-**

* Use `process.env.NODE_ENV === 'production'` to condition your code effect in development or production;

* According the content in `package.json`, replace `<%= process.env.NAME %>` or `<%= process.env.VERSION %>` to correct value, in `html` file;

* According the content in `package.json`, replace `process.env.NAME` or `process.env.VERSION` to correct value, in `js` file;

* Inject the file source which is require with `inline` attribute in HTML;

**-`npm run build js`-**

* Exec `$ npm run build js` to pack a single js file which is a subfile of `entry` directory;

* Put these comments in the top of the js file, then you use `$ npm run build js`, that it will follow those rule to pack;
```
/**
 * @webpack
 * @library example
 * @libraryTarget umd
 */
```

## License

MIT
