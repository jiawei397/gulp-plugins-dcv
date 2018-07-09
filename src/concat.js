const gulp = require('gulp');
const Q = require('q');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const util = require('./util');

let devDir,distDir;

let concatUtil = function (arr, name, cwd, dest) {
  cwd = cwd || devDir;
  dest = dest || distDir + '/js';
  var deffered = Q.defer();
  gulp.src(arr, {read: true, cwd: cwd})
    .pipe(uglify({
      compress: {
        drop_console: true, //删除console
        drop_debugger: true, //删除debugger
        typeofs: false //typeof xxx === "undefined"
      }
    }))
    .pipe(concat(name))
    .pipe(gulp.dest(dest))
    .on('end', function () {
      deffered.resolve();
    });
  return deffered.promise;
};

var concatFun = function (map, promises) {
  for (var key in map) {
    if (!key.includes('plugins') && key !== 'config' && !key.includes('config-')) {
      var value = map[key];
      if (Array.isArray(value)) {
        var str = key;
        if (key.startsWith('node-browser-') || key.startsWith('common-') || key.startsWith('node-') || key.startsWith('browser-')) {
          var arr = key.split('-');
          str = arr[arr.length - 1];
        }
        map[key] = ['js/' + str + '.js'];
        promises.push(concatUtil(value, str + '.js'));
      } else {
        concatFun(value, promises);
      }
    }
  }
};

module.exports = function (fileList, _devDir, _distDir) {
  devDir = _devDir;
  distDir = _distDir;
  var promises = [];
  concatFun(fileList.js, promises);
  promises.push(util.writeToFile(distDir + '/file_list.json', JSON.stringify(fileList, null, '\t')));
  return Promise.all(promises);
};
