const Proton = require('proton-js');

let canvas;
let context;
let emitter;
let proton;
let requestId;
let radiusInitialize;
let randomDriftBehaviour;

function loadImage() {
  const image = new Image();

  image.onload = ({ target }) => {
    const maxWidth = Math.round(canvas.width * 2 / 3);

    if (target.width > maxWidth) {

      target.height *= maxWidth / target.width;
      target.width = maxWidth;
    }

    const rect = new Proton.Rectangle(
      (canvas.width - target.width) / 2, (canvas.height - target.height) / 2,
      target.width, target.height
    );

    context.drawImage(target, rect.x, rect.y, rect.width, rect.height);
    createProton(rect);
  };
  image.src = '/images/topic.png';
}

function createProton(rect) {
  proton = new Proton();

  emitter = new Proton.Emitter();

  emitter.rate = new Proton.Rate(new Proton.Span(5, 8), .015);

  radiusInitialize = new Proton.Radius(3.0, 9.0);
  emitter.addInitialize(new Proton.Mass(1));
  emitter.addInitialize(radiusInitialize);
  emitter.addInitialize(new Proton.Life(new Proton.Span(2.0, 3.0)));
  var imagedata = context.getImageData(rect.x, rect.y, rect.width, rect.height);
  emitter.addInitialize(new Proton.Position(new Proton.ImageZone(imagedata, rect.x, rect.y)));

  randomDriftBehaviour = new Proton.RandomDrift(2, 1, .2);

  emitter.addBehaviour(new Proton.Gravity(0));
  emitter.addBehaviour(new Proton.Alpha(1, new Proton.Span(.1, .5)));
  emitter.addBehaviour(randomDriftBehaviour);
  emitter.addBehaviour(new Proton.Color(['#FFFFFF', '#FF7D90', '#FFFFFF', '#FFA2A1', '#FFD1B2']));
  emitter.addBehaviour(new Proton.CrossZone(
    new Proton.RectZone(0, 0, canvas.width, canvas.height), 'dead'
  ));
  emitter.addBehaviour({
    initialize(particle) {
      particle.oldRadius = particle.radius;
      particle.scale = 0;
    },
    applyBehaviour(particle) {
      if (particle.energy >= 2 / 3) {
          particle.scale = (1 - particle.energy) * 3;
      } else if (particle.energy <= 1 / 3) {
          particle.scale = particle.energy * 3;
      }
      particle.radius = particle.oldRadius * particle.scale;
    }
  });

  emitter.emit();

  proton.addEmitter(emitter);

  const renderer = new Proton.CanvasRenderer(canvas);
  proton.addRenderer(renderer);

  tick();
}

function tick() {
  requestId = window.requestAnimationFrame(tick);
  proton.update();
}

/**
 * @param {HTMLCanvasElement} element
 */
module.exports = (element) => {
  canvas = element;
  // canvas.width = canvas.parentNode.parentElement.clientWidth;
  // canvas.height = canvas.parentNode.parentElement.clientHeight;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context = canvas.getContext('2d');
  context.globalCompositeOperation = 'hard-light';

  return {
    start() {
      loadImage();
    },
    stop(delay) {
      randomDriftBehaviour.reset(100, 100, .05);
      emitter.stop();

      setTimeout(() => {
        proton.destroy();
        window.cancelAnimationFrame(requestId);
      }, delay || 0);
    }
  }
};
