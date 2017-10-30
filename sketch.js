groundYCoords = [];

// constants for what a seed does and looks like
var SEED_FALLING = 0;
var SEED_RESTING = 1;
var SEED_DIGGING = 2;
var SEED_GROWING = 3;
var SEED_RADIUS = 3;

// color definitions
var MIN_FADE_TIME = 40;
var MAX_FADE_TIME = 80;
var MAX_R = 255;
var MAX_G = 255;
var MAX_B = 255;
var MAX_ALPHA = 255;
var SEED_MIN_DEPTH = 10;
var SEED_MAX_DEPTH = 20;
var SEED_MIN_DIG_SPEED = 0.04;
var SEED_MAX_DIG_SPEED = 0.4;
var SEED_MIN_REST = 60;
var SEED_MAX_REST = 120;

// constants that affect living things (so deep)
var GRAVITY = 0.05;
var DECAY = 1.5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  colorMode(RGB, MAX_R, MAX_G, MAX_B, MAX_ALPHA);
  
  // draw soil
  stroke(MAX_R, MAX_G, MAX_B, MAX_ALPHA);
  strokeWeight(1);
}

function draw() {
  // let's start by drawing the ground
  
}

/* 
 * Gives a seed the following functionallity:
 * falling, resting, digging, growing
 */ 
function plantSeed(x, y) {
  // initialize starting position and velocity
  this.xPos = x;
  this.yPos = y;
  this.velocity = 0;
  this.alpha = MAX_ALPHA;
  this.status = SEED_FALLING;
  this.landingY = groundYCoords[x];
  this.restTime = round(random(SEED_MIN_REST, SEED_MAX_REST));
  this.digDepth = round(random(SEED_MIN_DEPTH, SEED_MAX_DEPTH));
  
  // draws seed 
  this.Display = function() {
    noStroke();
    fill(MAX_R, MAX_G, MAX_B, this.alpha);
    ellipse(this.xPos, this.yPos, SEED_RADIUS, SEED_RADIUS);
  };
  
  // updates seed coordinates when planted
  this.Update = function () {
    switch(this.status) {
      case SEED_FALLING:
        this.yPos += this.velocity;
        this.velocity += GRAVITY;
        
        // still falling?
        if (this.yPos >= this.landingY) 
          this.status = SEED_RESTING;
        break;

      case SEED_RESTING:
        this.restTime--;
        if (this.restTime <= 0)
          this.status = SEED_DIGGING;
        break;

      case SEED_DIGGING:
        // seed decelerates as it digs
        var digSpeed = SEED_MAX_DIG_SPEED * (1 - ((this.yPos - this.landingY) / (this.digDepth)));
        digSpeed = digSpeed > SEED_MIN_DIG_SPEED ? digSpeed : SEED_MIN_DIG_SPEED;
        this.yPos += digSpeed;

        if (this.yPos >= this.landingY + this.digDepth) {
          this.status = SEED_GROWING;
        }
        break;
      
      case SEED_GROWING:
        this.alpha -= DECAY;
        this.alpha = this.alpha > 0 ? this.alpha : 0;
        break;
    }
  };
}