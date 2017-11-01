/* Forest: a minimalistic interactive painting
 * Development is approached with the following steps
 * 1. draw the ground
 * 2. plant the seed
 * 3. grow tree branches
 * 4. grow leaves
 * 5. decay leaves
 * 6. repeat
 *
 */

var groundYCoords = [];
var seeds = [];
var trees = [];
var branchColors = [[]];
var isClicked = false;
var clickWait = 0;

// ground constants
var GROUND_AMPLITUDE = 15;
var GROUND_PERIOD = 30;
var MIN_Y_OFFSET = -120;
var MAX_Y_OFFSET = 120;
var MIN_SLOPE_LENGTH = 25;
var MAX_SLOPE_LENGTH = 20;
var MIN_GRADIENT = 0;
var MAX_GRADIENT = 1;


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

var RANDOM_FIX = 0.5;
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  colorMode(RGB, MAX_R, MAX_G, MAX_B, MAX_ALPHA);
  ellipseMode(RADIUS);
   calcGround();
   background(0);
  
  // draw soil
  stroke(MAX_R, MAX_G, MAX_B, MAX_ALPHA);
  strokeWeight(1);
  for (var i = 0; i < groundYCoords.length - 1; i++) {
    line(i, groundYCoords[i], i+1, groundYCoords[i+1]);
  }

  branchColors = [[color('#C6D8FF'),color('#71A9F7'),color('#6B5CA5'),color('#72195A'),color('#4C1036')],
  [color('#A5FFE5'),color('#8CC7A1'),color('#816E94'),color('#74226C'),color('#4B2142')],
  [color('#B02E0C'),color('#EB4511'),color('#C1BFB5'),color('#8EB1C7'),color('#FEFDFF')],
  [color('#1C3144'),color('#596F62'),color('#7EA16B'),color('#C3D898'),color('#70161E')],
  [color('#12355B'),color('#420039'),color('#D72638'),color('#FFA5A5'),color('#FF570A')],
  [color('#1C1C7F'),color('#CF5C36'),color('#EFC88B'),color('#F4E3B2'),color('#D3D5D7')],
  [color('#9BE564'),color('#D7F75B'),color('#D19C1D'),color('#7D451B'),color('#472C1B')],
  [color('#4C022C'),color('#DE3C4B'),color('#87F5FB'),color('#4C1E30'),color('#CEC3C1')],
  [color('#00274C'),color('#708D81'),color('#F4D58D'),color('#BF0603'),color('#8D0801')],
  [color('#E5D7E2'),color('#FF8811'),color('#143642'),color('#119EA0'),color('#B21911')]];

}

function draw() {
  // let's start by drawing the ground
  if (isClicked) {
    bacground(0);
    clickWait--;
    calcGround();

    // draw ground
    stroke(MAX_R, MAX_G, MAX_B, MAX_ALPHA);
    strokeWeight(1);
    for (var i = 0; i < groundYCoords.length - 1; i++) {
      line(i, groundYCoords[i], i+1, groundYCoords[i+1]);
    }

    // drop seeds and delete once planted
    strokeWeight(2);
    for (var i = seeds.length - 1; i >= 0; i--) {
      seeds[i].Run(); 
      if (!seeds[i].isAlive()) {
        seeds.splice(i, 1);
      }
  }
}

function mousePressed() {
  if (mouseY < groundYCoords[mouseX]) {
    if (!isClicked) {
      isClicked = true;
    }
    seeds.push(new PlantSeed(mouseX, mouseY));
    clickWait = 5;
  }
}

/* 
* Gives a seed the following functionallity:
* falling, resting, digging, growing
*/ 
function PlantSeed(x, y) {
 // initialize starting position and velocity
 this.xPos = x;
 this.yPos = y;
 this.velocity = 0;
 this.alpha = MAX_ALPHA;
 this.status = SEED_FALLING;
 this.landingY = groundYCoords[x];
 this.restTime = round(random(SEED_MIN_REST, SEED_MAX_REST));
 this.digDepth = round(random(SEED_MIN_DEPTH, SEED_MAX_DEPTH));

 this.Run = function() {
   this.Update();
   this.Display();
 }
  
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

/*
 * Calculates a sine wave for the ground at launch
 */
function calcGround() {
  var sketchWidth = width - 1;
  var lowestPoint = MIN_Y_OFFSET - (GROUND_AMPLITUDE * 2) - (MAX_SLOPE_LENGTH * MAX_GRADIENT);
  var currentX = 0;
  var yOffset = round(random(MIN_Y_OFFSET, MAX_Y_OFFSET));

  // generaates slopes for sine wave for the screen width
  while (currentX < sketchWidth) {
    // length and gradient of next slope
    var slopeLength = calcSlopeLength(sketchWidth - currentX);
    var slopeDirection = calcSlopeDirection(yOffset);
    var slopeGradient = round(random(MIN_GRADIENT, MAX_GRADIENT));
    slopeGradient *= slopeDirection;

    // calculates y values (sinewave + current slope)
    for (var x = currentX; x < currentX + slopeLength; x++) {
      var yBase = (GROUND_AMPLITUDE * sin(x / GROUND_PERIOD)) + (height + lowestPoint);
      yOffset += slopeGradient;
      groundYCoords[x] = round(yBase + yOffset);
    }
    currentX += slopeLength;
  }
}

/* 
 * Randomely determines the length of the next ground slope
 * this won't return a value longer than the remaining width of the screen
 */
function calcSlopeLength(remainingWidth) {
  if (remainingWidth < MIN_SLOPE_LENGTH) {
    return remainingWidth;
  } else if (remainingWidth < MAX_SLOPE_LENGTH) { 
    return round(random(MIN_SLOPE_LENGTH, remainingWidth));
  } else {
    return round(random(MIN_SLOPE_LENGTH, MAX_SLOPE_LENGTH));
  }
}

/* 
 * Randomely determines if there's an upward slope or downward slope
 * if the ground is above/below the min/max, then it slopes back to 0
 */
 function calcSlopeDirection(yOffset) {
   if (yOffset < MIN_Y_OFFSET) {
     return 1;
   } else if (yOffset > MAX_Y_OFFSET) {
     return -1;
   } else {
     return round(random(1)) == 1 ? 1 : -1;
   }
 }
