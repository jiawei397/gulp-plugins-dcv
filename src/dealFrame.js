/**
 * 处理可视化包的frame.js文件
 * 为了能够正确校验格式，我在该js前面加了一句：var FRAME =
 * 现在需要将它截取掉
 */
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// 常量
const PLUGIN_NAME = 'dealFrame';

// 插件级别函数 (处理文件)
let dealFrame = function () {
  // 创建一个让每个文件通过的 stream 通道
  var stream = through.obj(function (file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'streams not supported!'));
      return cb();
    }
    if (file.isBuffer()) {
      var contents = file.contents.toString();
      var endIndex = contents.lastIndexOf(';');
      var end = (endIndex === (contents.length - 1)) ? endIndex : undefined;
      file.contents = Buffer.from(contents.substring(contents.indexOf('{'), end));
    }

    // 确保文件进去下一个插件
    this.push(file);
    // 告诉 stream 转换工作完成
    cb();
  });

  // 返回文件 stream
  return stream;
};

// 暴露（export）插件的主函数
module.exports = dealFrame;
