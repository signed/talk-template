import type { Asciidoctor } from '@asciidoctor/core';
import asciidoctorFactory from '@asciidoctor/core';
import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import { create } from 'browser-sync';
import * as asciidoctorRevealjs from '@asciidoctor/reveal.js';

export interface ScribeOptions {
  watch: boolean;
  base_dir: string;
  out_dir: string;
}

// Sets additional document attributes, which override equivalently-named
// attributes defined in the document unless the value ends with @
const own: Asciidoctor.Attributes = {
  'slides': 'slides'
};

enum Transition {
  NONE = 'none',
  FADE = 'fade',
  SLIDE = 'slide',
  CONVEX = 'convex',
  CONCAVE = 'concave',
  ZOOM = 'zoom'
}

enum TransitionSpeed {
  SLOW = 'slow',
  DEFAULT = 'default',
  FAST = 'fast'
}

enum Theme {
  BLACK = 'black',
  WHITE = 'white',
  BEIGE = 'beige',
  SIMPLE = 'simple',
  MOON = 'moon',
  NIGHT = 'night',
  LEAGUE = 'league',
  SERIF = 'serif',
  SKY = 'sky',
  SOLARIZED = 'solarized'
}

const writePresentation = (options: ScribeOptions) => {
  fs.removeSync(options.out_dir);

  // https://asciidoctor.org/docs/asciidoctor-revealjs/#reveal-js-options
  const asciidoctor_reveal_js: Asciidoctor.Attributes = {
    'revealjsdir': '/node_modules/reveal.js@',
    'revealjs_history': true,
    'revealjs_theme': Theme.MOON,
    'revealjs_transition': Transition.NONE,
    'revealjs_transitionSpeed': TransitionSpeed.DEFAULT,
    'source-highlighter': 'highlightjs',
    'imagedir': '../images'
  };

  // These are the same as for the ruby version
  // http://asciidoctor.org/docs/user-manual/#ruby-api-options
  const asciidoctor_options: Asciidoctor.ProcessorOptions = {
    safe: 'safe',
    backend: 'revealjs',
    base_dir: options.base_dir,
    to_dir: options.out_dir,
    mkdirs: true,
    attributes: Object.assign({}, own, asciidoctor_reveal_js)
  };
  const asciidoctor = asciidoctorFactory();
  asciidoctorRevealjs.register();
  asciidoctor.convertFile('slides/presentation.adoc', asciidoctor_options);
};

export const present = (options: ScribeOptions) => {
  const browserSync = create('presentation');
  browserSync.init({
    server: true,
    online: false,
    ui: false,
    startPath: 'out/presentation.html',
    watchEvents: ['add'],
    logFileChanges: true
  });

  if (options.watch) {
    chokidar.watch(['slides/*.adoc', 'styles/*.css', 'images/*'])
      .on('all', (_event, _path) => {
        writePresentation(options);
        browserSync.reload();
      });
  } else {
    writePresentation(options);
  }
};

const watch = !process.argv.includes('--no-watch');
const base_dir = process.cwd();
const out_dir = './out';

present({
  watch,
  base_dir,
  out_dir
});
