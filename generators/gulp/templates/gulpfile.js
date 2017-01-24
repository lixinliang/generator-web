'use strict';

let gulp = require('gulp');
let fse = require('fs-extra');
let moment = require('moment');
let browserSync = require('browser-sync');
let packageJson = fse.readJsonSync('package.json');

const reload = browserSync.reload;
const banner =
`@ProjectName ${ packageJson.name }
@Version ${ packageJson.version }
@Author ${ packageJson.author.ngame }(${ packageJson.author.url })
@Update ${ moment().format('YYYY-MM-DD h:mm:ss a') }`;

gulp.task('dev', ['img', 'html', 'css', 'js'], () => {
    browserSync({
        server : {
            baseDir : "dest",
            directory : true,
        },
    });
});

gulp.task('img', () => {
    return gulp.src('src/img/**')
                .pipe(gulp.dest('dest/img'))
                .pipe(reload({ stream : true }));
});

gulp.task('html', () => {
    return gulp.src('src/*.html')
                .pipe(gulp.dest('dest'))
                .pipe(reload({ stream : true }));
});

(function(){
    let postcss = require('gulp-postcss');
    let assets  = require('postcss-assets');
    let cssnext = require('postcss-cssnext');
    let cssimport = require('postcss-import');
    let plugins = [
        assets(),
        cssimport(),
        cssnext({ browsers : ['last 2 version'] }),
    ];
    gulp.task('css', () => {
        return gulp.src('src/css/*.css')
                    .pipe(postcss(plugins))
                    .pipe(gulp.dest('dest/css'))
                    .pipe(reload({ stream : true }));
    });
})();

(function(){
    let rollup = require('gulp-better-rollup');
    let sass = require('rollup-plugin-sass');
    let babel = require('rollup-plugin-babel');
    let image = require('rollup-plugin-image');
    let commonjs = require('rollup-plugin-commonjs');
    let nodeResolve = require('rollup-plugin-node-resolve');
    let plugins = [
        sass(),
        image(),
        babel(),
        commonjs({
            sourceMap : false,
        }),
        nodeResolve({
            jsnext : true,
            main : true,
        }),
    ];
    gulp.task('js', () => {
        return gulp.src('src/js/*.js')
                    .pipe(rollup({ plugins : plugins }, { format : 'iife' }))
                    .pipe(gulp.dest('dest/js'))
                    .pipe(reload({ stream : true }));
    });
})();

gulp.task('default', ['dev'], () => {
    let watch = gulp.watch.bind(gulp);
    watch('src/img/**', ['img']);
    watch('src/*.html', ['html']);
    watch('src/css/**', ['css']);
    watch('src/js/**', ['js']);
});
