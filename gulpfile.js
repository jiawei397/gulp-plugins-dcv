let fileList = require('src/file_list');

gulp.task('release:concat', function () {
    return concat(fileList, 'test', 'dist')
});