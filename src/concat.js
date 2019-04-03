const gulp = require('gulp');
const Q = require('q');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const util = require('./util');
const Cache = require('cache-swap');
const cache = require('gulp-cache');

let devDir, distDir, fileCache;

let concatUtil = function (arr, name, cwd, dest) {
  cwd = cwd || devDir;
  dest = dest || distDir + '/js';
  var deffered = Q.defer();
  gulp.src(arr, {read: true, cwd: cwd})
    .pipe(cache(uglify({
      compress: {
        // drop_console: true, //删除console
        drop_debugger: false, //删除debugger
        pure_funcs: ['console.log', 'console.time', 'console.timeEnd', 'console.warn'],
        typeofs: false //typeof xxx === "undefined"
      }
    }), {
      fileCache: fileCache,
      name: 'concat'
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
        map[key] = ['js/' + str + '.min.js'];
        promises.push(concatUtil(value, str + '.min.js'));
      } else {
        concatFun(value, promises);
      }
    }
  }
};

/**
 * 合并压缩文件
 * @param {Array} fileList 文件内容
 * @param {String} _devDir 初始文件夹
 * @param {String} _distDir 目标文件夹
 * @param {String} cacheDirName 缓存名称
 * @author jw
 * @date 2018-07-12
 */
module.exports = function (fileList, _devDir, _distDir, cacheDirName = 'dcv-fl') {
  devDir = _devDir;
  distDir = _distDir;
  if (util.isWindows()) { //windows版本
    fileCache = new Cache({
      'cacheDirName': cacheDirName,
      'tmpDir': 'C:\\Documents\\gulp-cache'
    });
  } else {
    fileCache = new Cache({
      'cacheDirName': cacheDirName,
      'tmpDir': '../gulp-cache'
    });
  }
  var promises = [];
  concatFun(fileList.js, promises);
  promises.push(util.writeToFile(distDir + '/file_list.json', JSON.stringify(fileList, null, '\t')));
  return Promise.all(promises);
};
