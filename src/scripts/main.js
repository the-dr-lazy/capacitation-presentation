// Require Node modules in the browser thanks to Browserify: http://browserify.org
const bespoke    = require('bespoke');
const classes    = require('bespoke-classes');
const nav        = require('bespoke-nav');
const scale      = require('bespoke-scale');
const bullets    = require('bespoke-bullets');
const hash       = require('bespoke-hash');
const multimedia = require('bespoke-multimedia');
const extern     = require('bespoke-extern');
const voltair    = require('bespoke-theme-voltaire');

const topic = require('./topic');

// Bespoke.js
const deck = bespoke.from({ parent: 'article.deck', slides: 'section' }, [
  classes(),
  nav(),
  scale(),
  bullets('.build, .build-items > *:not(.build-items)'),
  hash(),
  multimedia(),
  extern(bespoke),
  voltair(),
]);

deck.slide(0);

const canvas = document.getElementById('topic-canvas');
const drawer = topic(canvas);
drawer.start();

deck.on('activate', ({ index }) => {
  if (index !== 0) {
    drawer.stop(3e3);
    return;
  }
});

deck.on('prev', ({ index }) => {
  if (index === 1) {
    drawer.start();
  }
});

