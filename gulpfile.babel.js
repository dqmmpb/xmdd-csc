var project           = 'xmdd-csc';
var src               = 'site';
var build             = 'build';
var dist              = 'dist';
var srcAssets         = 'site/assets';
var buildAssets       = 'build/assets';
var distAssets        = 'dist/assets';
var tar               = 'tar';
var test              = 'test';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var urlAdjuster = require('gulp-css-url-adjuster');
var mainBowerFiles = require('main-bower-files');
var wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var config = {
  browsersync: {
    build: {
      server: {
        baseDir: [build, src],
        routes: {
          '/bower_components': 'bower_components'
        }
      },
      port: 9000,
      files: [
        buildAssets + '/css/*.css',
        buildAssets + '/js/*.js',
        buildAssets + '/images/**',
        buildAssets + '/fonts/*',
        buildAssets + '/pie/*'
      ]
    },
    dist: {
      server: {
        baseDir: [dist]
      },
      port: 9001
    }
  },
  styles: {
    src: [srcAssets + '/less/viewframework/viewframework.less', srcAssets + '/less/xmddLess/login.less', srcAssets + '/less/xmdddemo/demo.less'],
    options: {
      autoprefixer: {
        browsers: [
          'Android >= 4',
          'Chrome >= 40',
          'last 6 Firefox versions',
          'iOS >= 6',
          'Safari >= 6'
        ],
        cascade: true
      }
    },
    dest: buildAssets + '/css'
  },
  jekyll: {
    src: ['site/portal'],
    dest: build
  },
  html: {
    src: build + '/**/*.html',
    dest: dist,
    useref: {
      searchPath: [build, src, '.']
    },
    jsfilter: ['**', '!**/main*.js'],
    cssfilter: ['**/*.css'],
    cssUrlReplace: {
      regExps:[/..\/img\//],
      newPath: '../images/'
    }
  },
  lint: {
    scripts: srcAssets + '/scripts/**/*.js'
  },
  images: {
    filter: '**/im**/*.{png,svg,jpg,jpeg,gif}',
    src: srcAssets + '/images/**/*',
    dest: buildAssets + '/images'
  },
  fonts: {
    filter: '**/*.{eot,svg,ttf,woff,woff2}',
    src:  srcAssets + '/fonts/**',
    dest: buildAssets + '/fonts'
  },
  extras: {
    src: [
      src + '/**/*.*',
      '!' + src + '/**/*.html',
      '!' + src + '/**/*.yml',
      '!' + srcAssets + '/**/.*',
      '!' + srcAssets + '/fonts/**',
      '!' + srcAssets + '/images/**',
      '!' + srcAssets + '/less/**/*.*',
      '!' + srcAssets + '/scripts/**/*.js',
      build + '/**/*.*',
      '!' + build + '/**/*.html',
      '!' + buildAssets + '/css/**/*.css'
    ],
    dest: dist
  },
  wiredep: {
    styles: {
      src: srcAssets + '/less/*.less',
      dest: srcAssets + '/less',
      ignorePath: /^(\.\.\/)+/
    },
    html: {
      src: src + '/**/*.html',
      dest: src,
      ignorePath: /^(\.\.\/)*\.\./
    }
  },
  watch: {
    less:  srcAssets + '/less/**/*.less',
    scripts: srcAssets + '/scripts/**/*.js',
    images: srcAssets + '/images/**/*',
    fonts: srcAssets + '/fonts/**/*',
    html: src + '/**/*.html',
    bower: 'bower.json',
    css: buildAssets + '/styles/**/*.css'
  },
  build: {
    src: build + '/**/*'
  },
  dist: {
    src: dist + '/**/*'
  },
  test: {
    browsersync: {
      server: {
        baseDir: [test],
        routes: {
          '/bower_components': 'bower_components'
        }
      },
      port: 8005
    },
    watch: {
      scripts: 'test/spec/**/*.js'
    },
    lint: {
      scripts: 'test/spec/**/*.js'
    }
  }
};

gulp.task('styles', function() {
  return gulp.src(config.styles.src)
    .pipe($.plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe($.sourcemaps.init())
    .pipe($.less({async:false}))
    .pipe($.autoprefixer(config.styles.options.autoprefixer))
    .pipe($.sourcemaps.write())
/*    .pipe($.px2rem({rootValue: 10}))*/
    .pipe(gulp.dest(config.styles.dest))
    .pipe(reload({stream: true}));
});

gulp.task('jekyll', function() {

  return gulp.src(config.jekyll.src)
    .pipe($.jekyllStream({
      bundleExec: false,
      quiet: true,
      safe: false,
      layouts: '_layouts'
    }))
    .pipe(gulp.dest(config.jekyll.dest))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      //.pipe($.eslint(options))
      //.pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint(config.lint.scripts));
gulp.task('lint:test', lint(config.test.lint.scripts, testLintOptions));

gulp.task('html', function() {

  var jsfilter = $.filter(config.html.jsfilter, {restore: true});
  var cssfilter = $.filter(config.html.cssfilter, {restore: true});

  /**
   * 替换合并后css中引用img的路径，'gulp images'已将依赖css中的png,jpg,svg,jpeg,gif等图片统一复制到images中
   * 对于不同依赖css中使用了同名文件的情况，暂时没有办法，先作为bug吧
   * @param url
   * @returns {*}
   */
  var cssUrlReplace = function(url) {
    // 正则表达式数组
    var regExps = config.html.cssUrlReplace.regExps;
    for(var i = 0; i < regExps.length; i++) {
      var regExp = regExps[i];
      if(regExp.test(url)) {
        return url.replace(regExp, config.html.cssUrlReplace.newPath);
      }
    }
    return url;
  };

  return gulp.src(config.html.src)
    .pipe($.useref({searchPath: config.html.useref.searchPath}))
    .pipe(jsfilter)
    .pipe($.if('*.js', $.uglify()))
    .pipe(jsfilter.restore)
    .pipe(cssfilter)
    .pipe($.if('*.css', urlAdjuster({replace: cssUrlReplace})))
    .pipe($.if('*.css', $.cleanCss({compatibility: '*', advanced: false})))
    .pipe(cssfilter.restore)
    .pipe(gulp.dest(config.html.dest));
});

gulp.task('images', function() {
  return gulp.src(mainBowerFiles(config.images.filter)
    .concat(config.images.src))
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(config.images.dest));
});

gulp.task('fonts', function() {
  return gulp.src(mainBowerFiles({
    filter: config.fonts.filter
  }).concat( config.fonts.src))
    .pipe(gulp.dest( config.fonts.dest));
});

gulp.task('extras', function() {
  return gulp.src(config.extras.src, {
    dot: true
  }).pipe(gulp.dest(config.extras.dest));
});

gulp.task('clean', function(cb) {
  del([build, dist], cb);
});

gulp.task('serve', ['build:sequence'], function() {

  browserSync({
    notify: false,
    port: config.browsersync.build.port,
    server: {
      baseDir: config.browsersync.build.server.baseDir,
      routes: config.browsersync.build.server.routes
    },
    files: config.browsersync.build.files
  });

  gulp.watch([
    config.watch.scripts,
    config.watch.images,
    config.watch.html,
    config.watch.fonts,
    config.watch.css
  ]).on('change', reload);

  gulp.watch(config.watch.less, ['styles']);
  gulp.watch(config.watch.fonts, ['fonts']);
  gulp.watch(config.watch.images, ['images']);
  gulp.watch(config.watch.bower, ['wiredep', 'fonts']);
  gulp.watch(config.watch.html, ['jekyll']);
});

gulp.task('serve:dist', ['dist:sequence'], function() {
  browserSync({
    notify: false,
    port: config.browsersync.dist.port,
    server: {
      baseDir: config.browsersync.dist.server.baseDir
    }
  });
});

gulp.task('serve:test', function() {
  browserSync({
    notify: false,
    port: config.test.browsersync.port,
    ui: false,
    server: {
      baseDir: config.test.browsersync.server.baseDir,
      routes: config.test.browsersync.server.routes
    }
  });
  gulp.watch(config.test.watch.scripts).on('change', reload);
  gulp.watch(config.test.watch.scripts, ['lint:test']);
});

// inject bower components
gulp.task('wiredep', function() {
  gulp.src(config.wiredep.styles.src)
    .pipe(wiredep({
      ignorePath: config.wiredep.styles.ignorePath
    }))
    .pipe(gulp.dest(config.wiredep.styles.dest));

  gulp.src(config.wiredep.html.src)
    .pipe(wiredep({
      ignorePath: config.wiredep.html.ignorePath
    }))
    .pipe(gulp.dest(config.wiredep.html.dest));
});

gulp.task('build', function() {
  return gulp.src(config.build.src).pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build:sequence', function(cb) {
  $.sequence('clean', 'lint', 'styles', 'fonts', 'images', 'jekyll', 'build', cb);
});

gulp.task('build:dist', function() {
  return gulp.src(config.dist.src).pipe($.size({title: 'build:dist', gzip: true}));
});

gulp.task('dist:sequence', function(cb) {
  $.sequence('build:sequence', 'html', 'extras', 'build:dist', cb);
});

gulp.task('default', function() {
  gulp.start('build:sequence');
});

gulp.task('dist', function() {
  gulp.start('dist:sequence');
});
