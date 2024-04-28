// Yernar Smagulov
// ysmagulo@ucsc.edu
// BlockyAnimal.js

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables 
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}


function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  // if (!u_Size) {
  //   console.log('Failed to get the storage location of u_Size');
  //   return;
  // }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set the initial value for this matrix to identity 
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;


// Globals related to the bird
let g_headAngle = 0;
let g_scapularAngle = 0;
let g_wingAngle = 0;
let g_headAnimation = false;
let g_scapularAnimation = false;
let g_wingAnimation = false;

// Globals related to the camera 
let g_cameraX = 0;
let g_cameraY = 0;
let g_cameraZ = 0;

// Globals for mouse control
let isDragging = false;
let mouseLastX = 0;
let mouseLastY = 0;
let g_yAngle = 0; // Global angle for Y-axis rotation
let g_xAngle = 0; // Global angle for X-axis rotation

// Model rotation angles
let g_modelYAngle = 0; // Global angle for Y-axis rotation of the model
let g_modelXAngle = 0; // Global angle for X-axis rotation of the model

function handleMouseDown(event) {
  // Start dragging
  isDragging = true;
  mouseLastX = event.clientX;
  mouseLastY = event.clientY;
}

function handleMouseUp(event) {
  // Stop dragging
  isDragging = false;
}

function handleMouseMove(event) {
  if (isDragging) {
    var deltaX = event.clientX - mouseLastX;
    var deltaY = event.clientY - mouseLastY;
    g_modelYAngle = (g_modelYAngle + deltaX) % 360;
    g_modelXAngle = (g_modelXAngle + deltaY) % 360;
    renderAllShapes();
  }
  mouseLastX = event.clientX;
  mouseLastY = event.clientY;
}


function addMouseControl() {
  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;
  canvas.onmouseout = handleMouseUp; // Handle the mouse going out of the viewport
  canvas.onmousemove = handleMouseMove;
}



// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  
  // Button Events 
  document.getElementById('animationHeadOffButton').onclick = function() {g_headAnimation = false;};
  document.getElementById('animationHeadOnButton').onclick = function() {g_headAnimation = true;};

  document.getElementById('animationScapularOffButton').onclick = function() {g_scapularAnimation = false;};
  document.getElementById('animationScapularOnButton').onclick = function() {g_scapularAnimation = true;};

  document.getElementById('animationWingsOffButton').onclick = function() {g_wingAnimation = false;};
  document.getElementById('animationWingsOnButton').onclick = function() {g_wingAnimation = true;};

  // Slider Events
  document.getElementById('headSlide').addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes(); });
  document.getElementById('ScapularSlide').addEventListener('mousemove', function() {g_scapularAngle = this.value; renderAllShapes(); });
  document.getElementById('WingsSlide').addEventListener('mousemove', function() {g_wingAngle = this.value; renderAllShapes(); });

  // Camera Angle Slider Events
	document.getElementById("x_angle").addEventListener('mousemove', function() {g_cameraX = this.value; console.log(this.value); renderAllShapes();});
	document.getElementById("y_angle").addEventListener('mousemove', function() {g_cameraY = this.value; console.log(this.value); renderAllShapes();});
	document.getElementById("z_angle").addEventListener('mousemove', function() {g_cameraZ = this.value; console.log(this.value); renderAllShapes();});
}


function main() {

  // get the canvas and gl context
  setupWebGL();
  
  // compile the shader programs, attach the javascript variables to the GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  addMouseControl(); // Activate mouse controls

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0-g_startTime;

  // Update Animation Angles
  updateAnimationAngles();
  
  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}



// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_headAnimation) {
    g_headAngle = 20 * Math.sin(2 * g_seconds) + 20;
  }
  if (g_scapularAnimation) {
    g_scapularAngle = 30 * Math.sin(2 * g_seconds);
  }
  if (g_wingAnimation) {
		g_wingAngle = 90 * Math.sin(8*g_seconds);
  }
}

// function that handles drawing the bird
function createTwiterBird() {

  // body 
  var body = new Cube();
  body.color = [0.114, 0.631, 0.949, 1.0]; // A vibrant blue
  body.matrix.translate(-0.25, -0.25, 0); 
  body.matrix.rotate(0, 1, 0, 0); 
  var bodyMatrix = new Matrix4(body.matrix); 
  body.matrix.scale(0.5, 0.2, 0.2); 
  body.render();
  
  // head
  var head = new Cube();
  head.color = body.color = [0.114, 0.631, 0.949, 1.0]; // A vibrant blue
  head.matrix = new Matrix4(bodyMatrix);
  head.matrix.translate(-0.15, 0, 0.025);
  head.matrix.rotate(g_headAngle, 0, 0, 1);
  var headMatrix = new Matrix4(head.matrix);
  head.matrix.scale(0.2, 0.275, 0.15);
  head.render();

  // left eye
  var left_eye = new Cube();
  left_eye.color = [0.0, 0.0, 0.0, 1.0]; // Black
  left_eye.matrix = new Matrix4(headMatrix);
  left_eye.matrix.translate(0.03, 0.115, -0.01); 
  left_eye.matrix.scale(0.09, 0.09, 0.01);
  left_eye.render();
  
  // left pupil
  var left_eye_pupil = new Cube();
  left_eye_pupil.color = [1.0, 1.0, 1.0, 1.0]; // White
  left_eye_pupil.matrix = new Matrix4(headMatrix);
  left_eye_pupil.matrix.translate(0.03, 0.115, -0.02); 
  left_eye_pupil.matrix.scale(0.04, 0.04, 0.01);
  left_eye_pupil.render();

  // right eye
  var right_eye = new Cube();
  right_eye.color = [0.0, 0.0, 0.0, 1.0]; // Black
  right_eye.matrix = new Matrix4(headMatrix);
  right_eye.matrix.translate(0.03, 0.115, 0.15); 
  right_eye.matrix.scale(0.09, 0.09, 0.01); 
  right_eye.render();
  
  // right pupil
  var right_eye_pupil = new Cube();
  right_eye_pupil.color = [1.0, 1.0, 1.0, 1.0]; // White
  right_eye_pupil.matrix = new Matrix4(headMatrix);
  right_eye_pupil.matrix.translate(0.03, 0.115, 0.16); 
  right_eye_pupil.matrix.scale(0.04, 0.04, 0.01); 
  right_eye_pupil.render();
  
  // nose
  var nose = new Cube();
  nose.color = [0.804, 0.522, 0.247, 1.0]; // Light Brown
  nose.matrix = new Matrix4(headMatrix);
  nose.matrix.translate(-0.03, 0.0375, 0); 
  nose.matrix.scale(0.03, 0.125, 0.15); 
  nose.matrix.translate(-2.83, 0.8, 0);
  nose.matrix.scale(3.83, -0.64, 1.0); 
  nose.render();

  // tail
  var tail = new Cube();
  tail.color = [0.678, 0.847, 0.902, 1.0]; // Light Blue
  tail.matrix = new Matrix4(bodyMatrix);
  tail.matrix.translate(0.45, 0.05, 0.05);
  tail.matrix.rotate(0, 1, 0, 0);
  tail.matrix.scale(0.15, 0.1, 0.1);
  tail.render();

  // left scapular
  var left_scapular = new Cube();
  left_scapular.color = [0.091, 0.505, 0.759, 1.0]; // Darker vibrant blue
  left_scapular.matrix = new Matrix4(bodyMatrix);
  left_scapular.matrix.translate(0.2, 0.08, -0.09); 
  left_scapular.matrix.rotate(g_scapularAngle, 0, 0, 1);
  left_scapular.matrix.translate(-0.05, 0, 0); 
  var frontLeftLegCoordMatrix = new Matrix4(left_scapular.matrix);
  left_scapular.matrix.scale(0.255, 0.06, 0.1); 
  left_scapular.render();

  // left wing
  var left_wing = new Cube();
  left_wing.color = [0.678, 0.847, 0.902, 1.0]; // Light Blue
  left_wing.matrix = new Matrix4(frontLeftLegCoordMatrix);
  left_wing.matrix.translate(0, 0.045, -0.002);
  left_wing.matrix.rotate(180 - g_wingAngle, 1, 0, 0);
  left_wing.matrix.translate(-0.0375, 0, 0); 
  left_wing.matrix.scale(0.4, 0.03, 0.2); 
  left_wing.render();

  // right scapular
	var right_scapular = new Cube();
  right_scapular.color = [0.091, 0.505, 0.759, 1.0]; // Darker vibrant blue
  right_scapular.matrix = new Matrix4(bodyMatrix);
  right_scapular.matrix.translate(0.2, 0.08, 0.2);
  right_scapular.matrix.rotate(g_scapularAngle, 0, 0, 1);
  right_scapular.matrix.translate(-0.05, 0, 0); 
  var frontRightLegCoordMatrix = new Matrix4(right_scapular.matrix);
  right_scapular.matrix.scale(0.255, 0.06, 0.1); 
  right_scapular.render();
	
  // right wing
  var right_wing = new Cube();
  right_wing.color = [0.678, 0.847, 0.902, 1.0]; // Light Blue
  right_wing.matrix = new Matrix4(frontRightLegCoordMatrix);
  right_wing.matrix.translate(0.05, 0.015, 0.1); // modify z here to make it further away from body
  right_wing.matrix.rotate(g_wingAngle, 1, 0, 0);
  right_wing.matrix.translate(-0.0875, 0, 0); 
  right_wing.matrix.scale(0.4, 0.03, 0.2); 
  right_wing.render();

  // rice hat out of a pyramid
  var hat = new Pyramid();
  hat.color = [0.85, 0.75, 0.60, 1.0]; // Straw color
  hat.matrix = new Matrix4(headMatrix);
  hat.matrix.translate(0.025, 0.27 , -0.008);
  hat.matrix.scale(0.2/1.4, 0.025/1.4, 0.225/1.4);
  hat.render();
  
}


// Draw every shape that is supposed to be on the canvas
function renderAllShapes() {
  // Check the time at the start of this function 
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Model rotation matrix
  var modelRotateMatrix = new Matrix4().rotate(g_modelXAngle, 1, 0, 0); // Rotate model around x-axis
  modelRotateMatrix.rotate(g_modelYAngle, 0, 1, 0); // Rotate model around y-axis

  // Camera rotation matrix
  var cameraRotateMatrix = new Matrix4().rotate(g_cameraX, 1, 0, 0); // Rotate camera around x-axis
  cameraRotateMatrix.rotate(g_cameraY, 0, 1, 0); // Rotate camera around y-axis
  cameraRotateMatrix.rotate(g_cameraZ, 0, 0, 1); // Rotate camera around z-axis

  // Combine the rotations
  var globalRotateMatrix = cameraRotateMatrix.multiply(modelRotateMatrix);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  // Draw the bird
  createTwiterBird();

  // Check the time at the end of the function, and show on the web page
  // var duration = performance.now() - startTime;
  // sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

  var endTime = performance.now();
  var renderTime = endTime - startTime;
  var fps = 1000 / renderTime; // Calculate frames per second

  sendTextToHTML(`Render Time: ${renderTime.toFixed(2)} ms, FPS: ${fps.toFixed(1)}`, "performanceIndicator");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


