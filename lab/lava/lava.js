let blobs = []; // An array to hold our lava blobs
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create 15 random blobs
  for (let i = 0; i < 15; i++) {
    blobs.push(new Blob());
  }
}

function draw() {
  // THE TRICK: instead of clearing the background completely,
  // we draw a semi-transparent black rectangle over the old frame.
  // This creates the "trails" or "blur" effect.
  noStroke();
  fill(10, 10, 20, 20); // R, G, B, Alpha (Transparency)
  rect(0, 0, width, height);

  // Update and draw each blob
  for (let blob of blobs) {
    blob.update();
    blob.show();
  }
}

// The Blueprint for a single Lava Blob
class Blob {
  constructor() {
    this.reset();
    this.y = random(height); // Start at random height initially
  }

  reset() {
    this.x = random(width);
    this.y = height + 50; // Start just below the screen
    this.size = random(40, 100);
    this.speed = random(1, 3);
    this.color = color(random(100, 255), random(0, 100), random(100, 255)); // Purple/Pink vibes
    this.offset = random(1000); // Random starting point for the sway
  }

  update() {
    // Move Up
    this.y -= this.speed;

    // Sway Side-to-Side using Sine Wave
    // sin() creates a smooth wave between -1 and 1
    this.x += sin(this.y * 0.01 + this.offset);

    // If it floats off the top, reset it to the bottom
    if (this.y < -this.size) {
      this.reset();
    }
  }

  show() {
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }
}

// Resize canvas if you stretch the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}