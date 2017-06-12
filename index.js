'use strict';

var path = require('path');
var through = require('through2');
var ngDep = require('ng-dependencies');
var toposort = require('toposort');
var gutil = require('gulp-util');
var _ = require('lodash');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-angular-filesort';
var ANGULAR_MODULE = 'ng';

var defaultOptions = {
  defaultExtension: '.js'
};
module.exports = function angularFilesort(options) {
  options = _.defaults(options, defaultOptions);
  var files = [];
  var ngModules = {};
  var toSort = [];
  var esModuleToSort = [];

  function transformFunction(file, encoding, next) {

    // Fail on empty files
    if (file.isNull()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'File: "' + file.relative + '" without content. You have to read it with gulp.src(..)'));
      return;
    }

    // Streams not supported
    if (file.isStream()) {
      /* jshint validthis:true */
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      next();
      return;
    }

    var deps;
    try {
      deps = ngDep(file.contents);
    } catch (err) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Error in parsing: "' + file.relative + '", ' + err.message));
      return;
    }

    if (deps.modules) {
      // Store references to each file with a declaration:
      Object.keys(deps.modules).forEach(function(name) {
        ngModules[name] = file;
      });
    }

    if (deps.dependencies) {
      // Add each file with dependencies to the array to sort:
      deps.dependencies.forEach(function(dep) {
        if (isDependecyUsedInAnyDeclaration(dep, deps)) {
          return;
        }
        if (dep === ANGULAR_MODULE) {
          return;
        }
        toSort.push([file, dep]);
      });
    }
    if(file.babel && file.babel.modules.imports.length > 0){
      var importPaths = file.babel.modules.imports
        .map(function (anImport) {
          return path.join(path.dirname(file.path), anImport.source + options.defaultExtension);
        });

      _.uniq(importPaths)
        .forEach(function(importPath){
          esModuleToSort.push([file, importPath]);
        });
    }

    files.push(file);
    next();

  }

  function flushFunction(next) {

    // Convert all module names to actual files with declarations:
    for (var i = 0; i < toSort.length; i++) {
      var moduleName = toSort[i][1];
      var declarationFile = ngModules[moduleName];
      if (declarationFile) {
        toSort[i][1] = declarationFile;
      } else {
        // Depending on module outside stream (possibly a 3rd party one),
        // don't care when sorting:
        toSort.splice(i--, 1);
      }
    }
    // Convert all module names to actual files with declarations:
    esModuleToSort = esModuleToSort.map(function (sortItem) {
      var importedFile = files.find(function(file){
        return file.path === sortItem[1];
      });
      if (importedFile) {
        return [sortItem[0], importedFile];
      } else {
        // importing a module outside stream (possibly a 3rd party one),
        // don't care when sorting:
        return undefined;
      }
    }).filter(_.identity);

    // Sort files alphabetically first to prevent random reordering.
    // Reverse sorting as it is reversed later on.
    files.sort(function (a, b) {
      if(a.path.toLowerCase().replace(a.extname, '') < b.path.toLowerCase().replace(b.extname, '')) return 1;
      if(a.path.toLowerCase().replace(a.extname, '') > b.path.toLowerCase().replace(b.extname, '')) return -1;
      return 0;
    });

    // Sort `files` with `toSort` as dependency tree:
    toposort.array(files, toSort.concat(esModuleToSort))
      .reverse()
      .forEach(function(file) {
        this.push(file);
      }.bind(this));

    next();
  }

  return through.obj(transformFunction, flushFunction);

};

function isDependecyUsedInAnyDeclaration(dependency, ngDeps) {
  if (!ngDeps.modules) {
    return false;
  }
  if (dependency in ngDeps.modules) {
    return true;
  }
  return Object.keys(ngDeps.modules).some(function(module) {
    return ngDeps.modules[module].indexOf(dependency) > -1;
  });
}
