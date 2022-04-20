const fs = require('fs');
const {dest, series, watch} = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const { exec } = require('child_process');

function emptyBuildFolder(cb) {
    if (!fs.existsSync('./build')) {
        fs.mkdirSync('./build');
    }
    del.sync(['./build/*']);
    cb();
}

function transpileTs() {

    const tsProject = ts.createProject('tsconfig.json');

    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(dest('build/script'));
}

function moveHTML(cb) {
    fs.readdir('src', (error, files) => {
        for(const file of files) {
            if(file.includes('.html')) {
                fs.copyFile('src/' + file, 'build/' + file, () => {});
            }
        }
    });
    cb();
    return;
}

function moveJS(cb) {
    fs.readdir('src/script', (error, files) => {
        for(const file of files) {
            if(file.includes('.js')) {
                fs.copyFile('src/script/' + file, 'build/script/' + file, () => {});
            }
        }
    });
    cb();
    return;
}

function moveAssets(cb) {
    fs.mkdir('build/assets', () => {});
    fs.readdir('src/assets', (error, files) => {
        for(const file of files) {
            fs.copyFile('src/assets/' + file, 'build/assets/' + file, () => {});
        }
    });
    cb();
    return;
}

function compileScss(cb) {
    exec('sass ./src/style/style.scss ./build/style/style.css');
    cb();
}

function startWatch(cb) {
    watch('src/**/*', series(emptyBuildFolder, transpileTs, moveAssets, moveHTML, moveJS, compileScss, deploy, watchSuccess));
}

function watchSuccess(cb) {
    console.log('Compilation Successful.');
    cb();
}

async function deploy(cb) {
    await Promise.resolve(exec('node deploy', (error, stdout, stderr) => {
        console.log(stdout);
    }));
    cb();
}

exports.build = series(
    emptyBuildFolder,
    moveHTML,
    transpileTs,
    moveAssets,
    moveJS,
);

exports.watch = series(
    emptyBuildFolder,
    transpileTs,
    moveHTML,
    moveAssets,
    moveJS,
    compileScss,
    deploy,
    startWatch
);
