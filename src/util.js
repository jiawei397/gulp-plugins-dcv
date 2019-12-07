var Q = require('q');
var fs = require('fs');
var os = require('os');
const path = require('path');

let util = {
  /**
   * 克隆对象
   * @param {Object} obj 克隆的对象
   * @param {Boolean} isDeep
   * @return {Array}  克隆后的对象
   */
  cloneObj: function fun (obj, isDeep) {
    if (isDeep === undefined) isDeep = false;

    if (typeof obj !== 'object' || obj == null) {
      return obj;
    }
    var c = obj instanceof Array ? [] : {};
    for (var i in obj) {
      var prop = obj[i];
      if (isDeep && typeof prop == 'object') {
        if (prop instanceof Array) {
          c[i] = [];

          for (var j = 0; j < prop.length; j++) {
            if (typeof prop[j] != 'object') {
              c[i].push(prop[j]);
            } else {
              c[i].push(fun(prop[j], isDeep));
            }
          }
        } else {
          c[i] = fun(prop, isDeep);
        }
      } else {
        c[i] = prop;
      }
    }

    return c;
  },
  /**
   * 合并对象 A中与B相同名称的元素会被替换成B中的值 返回长大了的A
   * @param {Object} opObjectA
   * @param {Object} opObjectB
   * @param {Boolean} isDeep
   * @param {Boolean} isReturnNew
   * @param {Boolean} isCloneObjDeep
   * @return {Object}
   */
  combine: function fun (opObjectA, opObjectB, isDeep, isReturnNew, isCloneObjDeep) {
    if (isReturnNew) {
      var tempFun = util.cloneObj;
      var result = tempFun(opObjectA, isCloneObjDeep);
      fun(result, opObjectB, isDeep, false);
      return result;
    }

    for (var cur in opObjectB) {
      if (isDeep) {
        if (opObjectA[cur] !== undefined && opObjectA[cur] !== null
          && !(opObjectA[cur] instanceof Array) && typeof opObjectA[cur] == 'object'
          && !(opObjectB[cur] instanceof Array) && typeof opObjectB[cur] == 'object') {
          fun(opObjectA[cur], opObjectB[cur], isDeep, false);
        } else {
          opObjectA[cur] = opObjectB[cur];
        }
      } else {
        opObjectA[cur] = opObjectB[cur];
      }
    }
    return opObjectA;
  },
  /**
   * 合并对象 只会在A的基础上添加元素,不影响原有元素 返回长大了的A
   * @param {Object} opObjectA
   * @param {Object} opObjectB
   * @param {Boolean} isDeep
   * @param {Boolean} isReturnNew
   * @param {Boolean} isCloneObjDeep
   * @return {Object}
   */
  combineNew: function fun (opObjectA, opObjectB, isDeep, isReturnNew, isCloneObjDeep) {
    if (isReturnNew) {
      var tempFun = util.cloneObj;
      var result = tempFun(opObjectA, isCloneObjDeep);
      fun(result, opObjectB, isDeep, false);
      return result;
    }

    for (var cur in opObjectB) {
      if (isDeep) {
        if (opObjectA[cur] !== undefined && opObjectA[cur] !== null
          && !(opObjectA[cur] instanceof Array) && typeof opObjectA[cur] == 'object'
          && !(opObjectB[cur] instanceof Array) && typeof opObjectB[cur] == 'object') {
          fun(opObjectA[cur], opObjectB[cur], isDeep, false);
        } else {
          if (opObjectA[cur] === undefined || opObjectA[cur] === null) opObjectA[cur] = opObjectB[cur];
        }
      } else {
        if (opObjectA[cur] === undefined || opObjectA[cur] === null) opObjectA[cur] = opObjectB[cur];
      }
    }
    return opObjectA;
  },
  writeToFile: function (path, data) {
    return Q.nfcall(fs.writeFile, path, data, 'utf8').then(function () {
      console.log(path + '写入完成; ');
    });
  },
  writeAppend: function (path, data) {
    return Q.nfcall(fs.appendFile, path, data, 'utf8').then(function () {
      console.log(path + 'write success;');
    });
  },
  readDirSync: function (fullPath, func) {
    if (!fs.existsSync(fullPath)) {
      console.error('文件夹不存在：', fullPath);
    } else {
      var pa = fs.readdirSync(fullPath);
      pa.forEach(function (ele, index) {
        var info = fs.statSync(path.join(fullPath, ele));
        if (info.isDirectory()) {
          util.readDirSync(path.join(fullPath, ele), func);
        } else {
          func(ele, fullPath);
        }
      });
    }
  },
  mkdirsSync: function mkdirsSync (dirname) {
    //console.log(dirname);
    if (fs.existsSync(dirname)) {
      return true;
    }
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  },
  isWindows: function () {
    return os.platform() === 'win32';
  }
};

module.exports = util;
