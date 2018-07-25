const Q = require('q');
const ftpClient = require('ftp');
const util = require('./util');
let client = ftpClient();

let ftpUtil = {
  handler: client,
  connect: function (ip, user, password) {
    let deferred = Q.defer();
    try {
      let host = ip;
      let port = 21;
      if (ip.includes(':')) {
        host = ip.split(':')[0];
        port = ip.split(':')[1];
      }
      client.connect({
        host: host,
        port: port,
        user: user,
        password: password
      });
      client.on('ready', function (error) {
        if (error) {
          console.error(error);
          deferred.reject(new Error(error));
        } else {
          console.log('connect success');
          deferred.resolve();
        }
      });
    } catch (e) {
      deferred.reject(new Error(e));
    }
    return deferred.promise;
  },
  rmdir: function (path, recursive) {
    let deferred = Q.defer();
    client.rmdir(path, recursive, function (error) {
      if (error) {
        // console.error(error);
        // deferred.reject(new Error(error));
        console.warn('删除文件夹错误');
        deferred.resolve(false);
      } else {
        deferred.resolve(true);
      }
    });
    return deferred.promise;
  },
  mkdir: function (path, recursive) {
    let deferred = Q.defer();
    client.mkdir(path, recursive, function (error) {
      if (error) {
        console.error(error);
        deferred.reject(new Error(error));
      } else {
        deferred.resolve();
      }
    });
    return deferred.promise;
  },
  put: function (input, destPath) {
    let deferred = Q.defer();
    client.put(input, destPath, false, function (error) {
      if (error) {
        console.error(error);
        deferred.reject(new Error(error));
      } else {
        console.info('upload:', input, '=>', destPath);
        deferred.resolve();
      }
    });
    return deferred.promise;
  },
  /**
   * 上传文件夹到目标文件夹
   */
  puts: function (localPath, destPath) {
    let deferred = Q.defer();
    let dirMap = {};
    let dirList = [];
    let localFileList = [];
    let remoteFileList = [];
    util.readDirSync(localPath, function (path, prefix) {
      let usePath = prefix.substr(localPath.length + 1).replace(/\\/g, '/');
      if (usePath) {
        dirMap[usePath] = true;
      }
      localFileList.push([prefix, path].join('\\'));
      remoteFileList.push([destPath, usePath, path].join('/'));
    });
    for (let i in dirMap) {
      dirList.push(destPath + i);
    }
    dirList.sort();
    let dirPromiseArray = [];
    //新建文件夹
    for (let i = 0; i < dirList.length; i++) {
      dirPromiseArray.push(ftpUtil.mkdir(dirList[i], true));
    }
    let filePormiseArray = [];
    //上传文件
    for (let i = 0; i < localFileList.length; i++) {
      filePormiseArray.push(ftpUtil.put(localFileList[i], remoteFileList[i]));
    }
    Q.all(dirPromiseArray)
      .then(function () {
        return Q.all(filePormiseArray);
      })
      .then(function () {
        deferred.resolve(localFileList);
      });
    return deferred.promise;
  },
  end: function () {
    let deferred = Q.defer();
    client.end();
    deferred.resolve();
    return deferred;
  }
};

/**
 * 暴露一个上传ftp的公用方法，包括连接、删除、创建文件夹、上传、结束整个流程
 * @author jw
 * @date 2018-07-11
 */
ftpUtil.upload = function (ip, user, password, localDir, rootDir) {
  return ftpUtil.connect(ip, user, password)
    .then(function () {
      return ftpUtil.rmdir(rootDir, true);
    })
    .then(function () {
      return ftpUtil.mkdir(rootDir, true);
    })
    .then(function () {
      return ftpUtil.puts(localDir, rootDir + '/');
    })
    .then(function () {
      return ftpUtil.end();
    });
};

// ftpUtil.connect({host: conf.ip, user: conf.user, password: conf.password});
module.exports = ftpUtil;
