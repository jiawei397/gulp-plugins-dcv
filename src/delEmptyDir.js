/**
 * Created by jw on 2017/3/14
 */
var fs = require('fs');
var Q = require('q');
var readdir = Q.denodeify(fs.readdir);
var stat = Q.denodeify(fs.stat);
var rmdir = Q.denodeify(fs.rmdir);

function del (dir) {
  return readdir(dir).then((fileArr) => {
    if (fileArr === undefined) return;
    //如果该目录下还有文件或目录，判断查看它们的信息
    if (fileArr[0]) {
      var promises = fileArr.map(function (item) {
        return stat(dir + '/' + item).then(function (stats) {
          //如果是目录, 继续遍历
          if (stats.isDirectory()) {
            // console.log(dir + '/' + item);
            return del(dir + '/' + item);
          }
        });
      });
      return Q.all(promises);
    }
    console.log('删除空文件夹：' + dir);
    return rmdir(dir);
  });
}

module.exports = function (dir) {
  return del(dir).then(function () {
    console.log('删除空文件夹成功');
    return del(dir);
  }).catch(function (err) {
    console.log('删除出错\n', err);
  });
};
