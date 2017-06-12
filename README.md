# gulp-angular-esmodules-filesort [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

## Additions to gulp-angular-filesort

This plugin is a fork of [gulp-angular-filesort](https://npmjs.org/package/gulp-angular-filesort)
which adds support for additional file sorting logic based on ES6 import and exports.

If the following conditions are true, you might want to use this plugin:
- You have an old angular project and you are using script tags instead
of bundlers like **webpack** 
- You are using babel to leverage ES6 features and you want to be able 
to use ES6 module system.
- You are not considering moving the whole project structure from 
**a bunch of js files** to es6 modules and using bundlers, but there are 
causes you want to import and export stuff in your files.

**NOTE**: In order to be able to use es6 import/exports without a bundler,
you need to use 
[babel-plugin-globals](https://www.npmjs.com/package/babel-plugin-globals)
to convert import/exports to read/writes from/to a global object (aka namespace)

------------

## WARNING: Considering this for new apps? Don't!

**Use something like [Browserify](http://browserify.org/) or [Webpack](https://webpack.github.io/) instead!**

---

> Automatically sort AngularJS app files depending on module definitions and usage

Used in conjunction with [`gulp-inject`](https://www.npmjs.org/package/gulp-inject) to inject your AngularJS application files (scripts) in a correct order, to get rid of all `Uncaught Error: [$injector:modulerr]`.  To work correctly, each angular file needs to have a uniquely named module and setter syntax (with the brackets), i.e. `angular.module('myModule', [])`.

## Installation

Install `gulp-angular-esmodules-filesort` as a development dependency:

```shell
npm install --save-dev gulp-angular-esmodules-filesort
```

## Usage

### In your `gulpfile.js`:

```javascript
var angularFilesort = require('gulp-angular-esmodules-filesort'),
    inject = require('gulp-inject');

gulp.src('./src/app/index.html')
  .pipe(inject(
    gulp.src(['./src/app/**/*.js']).pipe(angularFilesort())
  ))
  .pipe(gulp.dest('./build'));
```

**NOTE** Do not use the `read` option for `gulp.src`! This plugin analyzes the contents of each file to determine sort order.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-angular-esmodules-filesort
[npm-image]: https://badge.fury.io/js/gulp-angular-esmodules-filesort.png

[travis-url]: http://travis-ci.org/klei/gulp-angular-esmodules-filesort
[travis-image]: https://secure.travis-ci.org/klei/gulp-angular-esmodules-filesort.png?branch=master

[depstat-url]: https://david-dm.org/klei/gulp-angular-esmodules-filesort
[depstat-image]: https://david-dm.org/klei/gulp-angular-esmodules-filesort.png
