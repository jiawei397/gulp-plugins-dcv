/**
 * Created by jw on 2017/3/14
 */
var fs = require('fs');
var Q = require('q');
var readdir = Q.denodeify(fs.readdir);
var stat = Q.denodeify(fs.stat);
var rmdir = Q.denodeify(fs.rmdir);

function del (dir, arr = []) {
  return readdir(dir).then((fileArr) => {
    if (fileArr === undefined) return;
    //如果该目录下还有文件或目录，判断查看它们的信息
    if (fileArr[0]) {
      var promises = fileArr.map(function (item) {
        return stat(dir + '/' + item).then(function (stats) {
          //如果是目录, 继续遍历
          if (stats.isDirectory()) {
            // console.log(dir + '/' + item);
            return del(dir + '/' + item, arr);
          }
        });
      });
      return Q.all(promises);
    }
    arr.push(dir);
    console.log('删除空文件夹：' + dir);
    return rmdir(dir);
  });
}
/**
 * 递归删除空文件夹
 */
let recursiveDel = async function (dir) {
  let arr = [];
  await del(dir, arr);
  if(arr.length > 0){
    await recursiveDel(dir);
  }
};

module.exports = function (dir) {
  return recursiveDel(dir).then(function () {
    console.log('删除空文件夹成功');
  }).catch(function (err) {
    console.log('删除出错\n', err);
  });
};
