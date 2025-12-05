// --- Wormhole Parameters ---
const Z_SEGMENTS = 20; // Number of longitudinal lines
const PHI_SEGMENTS = 30; // Number of circumferential lines
const Z_MIN = -150;
const Z_MAX = 150;
const THROAT_A = 30; // Radius of the throat (narrowest part)

// --- Drawing State for Turtle Simulation ---
let drawPhase = 0; // 0: Longitudinal, 1: Circumferential
let currentLineIndex = 0;
let currentSegmentIndex = 0;
let drawingComplete = false;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  frameRate(25);

  ambientLight(50);
  pointLight(255, 255, 255, 0, 0, 500);
}

function getRadius(z) {
  // Equation for a hyperbolic surface
  return sqrt(THROAT_A * THROAT_A + z * z);
}

function toCartesian(r, phi, z) {
  let x = r * cos(phi);
  let y = r * sin(phi);
  // Map Z (depth) to Y (vertical), and Y (vertical radius) to Z (depth) in p5.js WEBGL
  return { x: x, y: z, z: y };
}

// --- DRAWING LOOP ---
function draw() {
  background(0, 0, 0);

  orbitControl();

  // Apply initial tilt for the angled view
  rotateX(PI / 4);

  stroke(10, 50, 110, 200);
  strokeWeight(1.5);
  noFill();

  // --- 1. RENDER ALL EXISTING LINES ---
  // Always render the longitudinal lines (Phase 0) up to their current state.
  renderLongitudinalLines(currentLineIndex, currentSegmentIndex, drawPhase);

  // Only render circumferential lines (Phase 1) if we have reached phase 1.
  if (drawPhase >= 1) {
    renderCircumferentialLines(currentLineIndex, currentSegmentIndex);
  }

  // --- 2. ADVANCE THE DRAWING STATE (Only if not complete) ---
  if (!drawingComplete) {
    advanceDrawingState();
  }
}

// Function to render the longitudinal lines (constant Phi)
function renderLongitudinalLines(maxLine, maxSeg, currentPhase) {
  const effectiveMaxLine = currentPhase === 1 ? Z_SEGMENTS : maxLine;

  for (let phiIndex = 0; phiIndex <= effectiveMaxLine; phiIndex++) {
    let phi = map(phiIndex, 0, Z_SEGMENTS, 0, TWO_PI);

    beginShape();
    let segmentsToDraw = Z_SEGMENTS;
    if (currentPhase === 0 && phiIndex === maxLine) {
      segmentsToDraw = maxSeg;
    } else if (currentPhase === 0 && phiIndex > maxLine) {
      continue;
    }

    for (let zIndex = 0; zIndex <= segmentsToDraw; zIndex++) {
      let z = map(zIndex, 0, Z_SEGMENTS, Z_MIN, Z_MAX);
      let r = getRadius(z);
      let pos = toCartesian(r, phi, z);

      // Jitter for the scribble effect
      let jitter = noise(phiIndex * 0.1, zIndex * 0.1) * 2;
      vertex(pos.x + jitter, pos.y + jitter, pos.z + jitter);
    }
    endShape();
  }
}

// Function to render the circumferential lines (constant Z)
function renderCircumferentialLines(maxLine, maxSeg) {
  for (let zIndex = 0; zIndex <= maxLine; zIndex++) {
    let z = map(zIndex, 0, PHI_SEGMENTS, Z_MIN, Z_MAX);
    let r = getRadius(z);

    beginShape();
    let segmentsToDraw = PHI_SEGMENTS;
    if (zIndex === maxLine) {
      segmentsToDraw = maxSeg;
    } else if (zIndex > maxLine) {
      continue;
    }

    for (let phiIndex = 0; phiIndex <= segmentsToDraw; phiIndex++) {
      let phi = map(phiIndex, 0, PHI_SEGMENTS, 0, TWO_PI);
      let pos = toCartesian(r, phi, z);

      // Jitter for the scribble effect
      let jitter = noise(zIndex * 0.1, phiIndex * 0.1) * 2;
      vertex(pos.x + jitter, pos.y + jitter, pos.z + jitter);
    }
    endShape();
  }
}

// Function to advance the state variables
function advanceDrawingState() {
  if (drawPhase === 0) {
    // Advancing Longitudinal Lines
    currentSegmentIndex++;
    if (currentSegmentIndex > Z_SEGMENTS) {
      currentSegmentIndex = 0;
      currentLineIndex++;
    }

    // Phase Transition Check
    if (currentLineIndex > Z_SEGMENTS) {
      currentLineIndex = 0;
      currentSegmentIndex = 0;
      drawPhase = 1; // Move to Phase 1
    }
  } else if (drawPhase === 1) {
    // Advancing Circumferential Lines
    currentSegmentIndex++;
    if (currentSegmentIndex > PHI_SEGMENTS) {
      currentSegmentIndex = 0;
      currentLineIndex++;
    }

    // Drawing Completion Check
    if (currentLineIndex > PHI_SEGMENTS) {
      drawingComplete = true;
      // The draw loop continues to run for mouse interaction!
    }
  }
}
