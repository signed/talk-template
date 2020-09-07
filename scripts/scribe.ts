import type { Asciidoctor } from '@asciidoctor/core';
import asciidoctorFactory from '@asciidoctor/core';
import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import { create } from 'browser-sync';
import * as asciidoctorRevealjs from '@asciidoctor/reveal.js';

const watch = !process.argv.includes('--no-watch');
const base_dir = process.cwd();
const out_dir = './out';

const asciidoctor = asciidoctorFactory();
asciidoctorRevealjs.register();
const bs = create('presentation');

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
const options: Asciidoctor.ProcessorOptions = {
  safe: 'safe',
  backend: 'revealjs',
  base_dir: base_dir,
  to_dir: out_dir,
  mkdirs: true,
  attributes: Object.assign({}, own, asciidoctor_reveal_js)
};

bs.init({
  server: true,
  online: false,
  ui: false,
  startPath: 'out/presentation.html',
  watchEvents: ['add'],
  logFileChanges: true
});

const writePresentation = () => {
  fs.removeSync(out_dir);
  asciidoctor.convertFile('slides/presentation.adoc', options);
};

const present = () => {
  if (watch) {
    chokidar.watch(['slides/*.adoc', 'styles/*.css', 'images/*'])
      .on('all', (_event, _path) => {
        writePresentation();
        bs.reload();
      });
  } else {
    writePresentation();
  }
};

present();
