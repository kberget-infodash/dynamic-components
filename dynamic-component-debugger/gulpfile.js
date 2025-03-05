'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
const path = require('path');
const fs = require('fs');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);


// Watch for changes in the library and rebuild the web part
gulp.task('watch-library', (done) => {
  const libraryPath = path.resolve(__dirname, '../dynamic-component-library/lib');
  
  if (!fs.existsSync(libraryPath)) {
      console.log(`Library path not found: ${libraryPath}`);
      return done();
  }

  gulp.watch(`${libraryPath}/**/*`, gulp.series('build'));
  done();
});

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */

build.initialize(require('gulp'));

