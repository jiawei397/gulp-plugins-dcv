const gulp = require('gulp');
const inject = require('gulp-inject');
const injectString = require('gulp-inject-string');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const $if = require('gulp-if');

/**
 * 替换引用的js/css到html
 * @param {String} html 要注入的Html名称
 * @param {Object} options 配置信息
 * @exmaple
 * {jsDir:'',entryDir:'',destDir:'',commonPluginsJs:'',htmlMinOptions:{},commonPluginsJs:'',htmlMinOptions:true,replace:{},rename:'',exInject:{}}
 */
module.exports = function (html, options) {
  var cwd = options.jsDir;
  var entryDir = options.entryDir || './src/entry/';
  var commonPlugins = options.commonPluginsJs || '/base/js/util.js';
  var commonPluginsStr = '\n';
  if (Array.isArray(commonPlugins)) {
    commonPlugins = commonPlugins.map(function (str) {
      return '<script src="' + str + '"></script>';
    });
    commonPluginsStr += commonPlugins.join('\n');
  } else {
    commonPluginsStr += '<script src="' + commonPlugins + '"></script>';
  }
  var temp = gulp.src([html], {cwd: entryDir})
    .pipe(injectString.after('<!-- start:common-pluginsJs -->', commonPluginsStr))
    .pipe($if(!!options.pre, inject(gulp.src(options.pre, {read: false, cwd: cwd}), {
      relative: true,
      starttag: '<!-- start:pre-init -->',
      transform: options.transformJsFun
    })))
    .pipe($if(!!options.init, inject(gulp.src(options.init, {read: false, cwd: cwd}), {
      relative: true,
      starttag: '<!-- start:initJs -->',
      transform: options.transformJsFun
    })))
    .pipe($if(!!options.app, inject(gulp.src(options.app, {read: false, cwd: cwd}), {
      relative: true,
      starttag: '<!-- start:appJs -->',
      transform: options.transformJsFun
    })));
  var exInject = options.exInject;
  if (exInject && exInject.glob && exInject.starttag) {
    var exInjectOptions = exInject.options || {read: false, cwd: cwd};
    temp = temp.pipe(inject(gulp.src(exInject.glob, exInjectOptions), {
      relative: true,
      starttag: exInject.starttag,
      transform: exInject.transform || options.transformJsFun
    }));
  }
  if (options.htmlMinOptions) {
    var htmlMinOptions = options.htmlMinOptions;
    if (typeof options.htmlMinOptions === 'boolean') {
      htmlMinOptions = {
        'removeComments': true, //清除HTML注释
        'collapseWhitespace': true, //压缩HTML
        'collapseBooleanAttributes': true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        'removeEmptyAttributes': true, //删除所有空格作属性值 <input id="" /> ==> <input />
        'removeScriptTypeAttributes': true, //删除<script>的type="text/javascript"
        'removeStyleLinkTypeAttributes': true, //删除<style>和<link>的type="text/css"
        'minifyJS': false, //压缩页面JS
        'minifyCSS': true //压缩页面CSS
      };
    }
    temp = temp.pipe(htmlmin(htmlMinOptions));
  }
  if (options.rename) {
    temp = temp.pipe(rename(options.rename));
  }
  if (options.replace) {
    if (typeof options.replace === 'boolean') {
      temp = temp.pipe(injectString.replace('/base/', '/tarsier-vmdb/dcvWeb/base/'));
    } else if (typeof options.replace === 'string') {
      temp = temp.pipe(injectString.replace('/base/', options.replace));
    } else if (typeof options.replace === 'object') {
      for (var key in options.replace) {
        temp = temp.pipe(injectString.replace(key, options.replace[key]));
      }
    }
  }
  return temp.pipe(gulp.dest(options.destDir));
};
