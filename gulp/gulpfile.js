var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'), // 压缩
    jshint = require('gulp-jshint'), // js代码校验
    uglify = require('gulp-uglify'), // 混淆js
    clean = require('gulp-clean'), // 清理文件
    rev = require('gulp-rev'), // 加MD5后缀
    concat = require('gulp-concat'), // 合并js文件
    revCollector = require('gulp-rev-collector'), // 从manifest文件中收集数据并且替换html模板中的链接
    runSequence = require('run-sequence'); // 控制task顺序

var filepath = 'project/src/main/webapp/static/';

var DEV = 'dev';
var PROD = 'prod';
var environment = DEV;

//清空文件夹，避免资源冗余
gulp.task('clean', function () {
    return gulp.src(filepath + 'dist', {read: false}).pipe(clean());
});

//css文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出来
gulp.task('css', function () {
    gulp.src(filepath + 'css/**/*.{png,jpg,gif,ico}')
        .pipe(gulp.dest(filepath + 'dist/css/'));

    return gulp.src(filepath + 'css/**/*.css')
        .pipe(gulpif(PROD === environment, minifyCss()))
        .pipe(rev())
        .pipe(gulp.dest(filepath + 'dist/css/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(filepath + 'dist/rev/css'))
});

//js文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出
gulp.task('js', function () {
    return gulp.src(filepath + 'js/**/*.js')
        .pipe(jshint())
        .pipe(gulpif(PROD === environment, uglify()))
        .pipe(rev())
        .pipe(gulp.dest(filepath + 'dist/js/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(filepath + 'dist/rev/js'))
});

gulp.task('image', function () {
    return gulp.src(filepath + 'images/**/*.{png,jpg,gif,ico}')
        .pipe(gulp.dest(filepath + 'dist/images/'))
});

gulp.task('font', function () {
    return gulp.src(filepath + 'fonts/**/*')
        .pipe(gulp.dest(filepath + 'dist/fonts/'))
});

//通过hash来精确定位到html模板中需要更改的部分,然后将修改成功的文件生成到指定目录
gulp.task('rev', function () {
    return gulp.src([filepath + 'dist/rev/**/*.json', filepath + 'views/**/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '/css/': '/dist/css/',
                '/js/': '/dist/js/'
            }
        }))
        .pipe(gulp.dest(filepath + 'dist/views/'));
});

gulp.task('build', function (done) {
    runSequence(
        ['clean'],
        ['css'],
        ['js'],
        ['image'],
        ['font'],
        ['rev'],
        done);
});

gulp.task('dev', function () {
    environment = DEV;
    runSequence(['build']);
});

gulp.task('prod', function () {
    environment = PROD;
    runSequence(['build']);
});

gulp.task('help', function () {
    console.info('用法: gulp [options]');
    console.info('其中选项包括:');
    console.info('           css和js压缩处理');
    console.info('    dev    css和js不做压缩处理');
    console.info('    prod   css和js压缩处理');
});

// 默认任务
gulp.task('default', ['build']);
