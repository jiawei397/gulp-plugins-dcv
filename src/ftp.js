const Q = require('q');
const ftpClient = require('ftp');
const util = require('./util');
let client = ftpClient();

let ftpUtil = {
    handler: client,
    connect: function (ip, user, password) {
        let deferred = Q.defer();
        ftpUtil.handler.connect({
            host: ip,
            user: user,
            password: password
        });
        deferred.resolve();
        return deferred;
    },
    ready: function () {
        let deferred = Q.defer();
        ftpUtil.handler.on('ready', function (error) {
            if (error) {
                console.error(error);
                deferred.reject(new Error(error));
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    },
    rmdir: function (path, recursive) {
        let deferred = Q.defer();
        ftpUtil.handler.rmdir(path, recursive, function (error) {
            if (error) {
                console.error(error);
                deferred.reject(new Error(error));
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    },
    mkdir: function (path, recursive) {
        let deferred = Q.defer();
        ftpUtil.handler.mkdir(path, recursive, function (error) {
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
        ftpUtil.handler.put(input, destPath, false, function (error) {
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
        Q.all(dirPromiseArray).then(function () {
            return Q.all(filePormiseArray);
        }).then(function () {
            deferred.resolve(localFileList);
        });
        return deferred.promise;
    },
    end: function () {
        let deferred = Q.defer();
        ftpUtil.handler.end();
        deferred.resolve();
        return deferred;
    }
};

// ftpUtil.connect({host: conf.ip, user: conf.user, password: conf.password});
module.exports = ftpUtil;
