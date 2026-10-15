var gridBounds = new THREE.Box3(
  new THREE.Vector3(-CONFIG.GRID_SIZE_X, -CONFIG.GRID_SIZE_Y, -CONFIG.GRID_SIZE_Z),
  new THREE.Vector3(CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, CONFIG.GRID_SIZE_Z)
);
var nodes = {};
function setAt(position, value) {
  nodes["(" + position.x + ", " + position.y + ", " + position.z + ")"] = value;
}
function getAt(position, value) {
  return nodes["(" + position.x + ", " + position.y + ", " + position.z + ")"];
}
function clearGrid() {
  nodes = {};
}
const clock = new THREE.Clock();

var bgImageContainer = document.getElementById("background-image");
var bgImgFile = document.getElementById("background-image-img");
if (CONFIG.IMAGE_NAME != "") {
  var ext = CONFIG.IMAGE_NAME.match(/\.([^.\\/]+)$/);
  if (ext) {
    bgImgFile.src = "./images/" + CONFIG.IMAGE_NAME;
  } else {
    bgImgFile.src = "./images/" + CONFIG.IMAGE_NAME + ".png";
  }
}
if (CONFIG.HIDE_IMAGE)
  bgImageContainer.style.display = "none";

if (CONFIG.ENABLE_PALETTE_BG_COLOR)
  document.body.style.background = "#" + PALETTES[CONFIG.SELECTED_PALETTE].bg.toString(16);
else
  document.body.style.background = "#000000"; // redundancy

var textures = {};
var Pipe = function(scene, options) {
  var self = this;
  var pipeRadius = CONFIG.PIPE_RADIUS;
  var ballJointRadius = CONFIG.PIPE_RADIUS * 1.5;

  self.palette = PALETTES[options.palette].colors || PALETTES["windowsxp"].colors; // fallback

  self.accumulatedTime = 0;
  self.moveInterval = CONFIG.PIPE_MOVE_INTERVAL;

  self.done = false;
  self.previousDone = false;
  
  self.hasOpenSpot = false;

  self.expectedLifeChance = chance(CONFIG.SHORTPIPE_CHANCE) ? random(CONFIG.SHORTPIPE_MIN_LENGTH, CONFIG.SHORTPIPE_MAX_LENGTH) : random(CONFIG.LONGPIPE_MIN_LENGTH, CONFIG.LONGPIPE_MAX_LENGTH);

  self.currentPosition = randomIntegerVector3WithinBox(gridBounds);
  self.positions = [self.currentPosition];
  self.object3d = new THREE.Object3D();
  scene.add(self.object3d);
  if (options.texturePath) {
    self.material = new THREE.MeshLambertMaterial({
      map: textures[options.texturePath],
    });
  } else {
    var color = self.palette.length === 0
      ? randomInteger(0, 0xffffff)
      : self.palette[randomInteger(0, self.palette.length - 1)];
    var emissive = new THREE.Color(color).multiplyScalar(0.3);
    if (CONFIG.PIPE_MATERIAL == PIPE_MATERIALS.METAL) {
      self.material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        roughness: 1 - CONFIG.PIPE_SHININESS,
        metalness: CONFIG.PIPE_METALNESS,
      });
    } else {
      self.material = new THREE.MeshPhongMaterial({
        specular: 0xa9fcff,
        color: color,
        emissive: emissive,
        shininess: CONFIG.PIPE_SHININESS * 100,
      });
    }
  }
  var makeCylinderBetweenPoints = function(fromPoint, toPoint, material) {
    var deltaVector = new THREE.Vector3().subVectors(toPoint, fromPoint);
    var arrow = new THREE.ArrowHelper(
      deltaVector.clone().normalize(),
      fromPoint
    );
    var geometry = new THREE.CylinderGeometry(
      pipeRadius,
      pipeRadius,
      deltaVector.length(),
      10,
      4,
      true
    );
    var mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.setFromQuaternion(arrow.quaternion);
    mesh.position.addVectors(fromPoint, deltaVector.multiplyScalar(0.5));
    mesh.updateMatrix();

    self.object3d.add(mesh);
  };
  var makeBallJoint = function(position, radius) {
    var ball = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 8, 8),
      self.material
    );
    ball.position.copy(position);
    self.object3d.add(ball);
  };
  var makeElbowJoint = function(fromPosition, toPosition, tangentVector) {
    // todo - better joint - ol chap had some ideas here I'll look into

    // "elball" (not a proper elbow)
    var elball = new THREE.Mesh(
      new THREE.SphereGeometry(pipeRadius, 8, 8),
      self.material
    );
    elball.position.copy(fromPosition);
    self.object3d.add(elball);
  };

  // if (getAt(self.currentPosition)) {
  //   self.currentPosition = randomIntegerVector3WithinBox(gridBounds);
  //   return; // TODO: find a position that's free
  // }
  setAt(self.currentPosition, self);

  makeBallJoint(self.currentPosition, ballJointRadius);

  var totalTimeElapsed = 0;

  self.finishPipe = function() {
    makeBallJoint(self.currentPosition, 0.2);
    self.done = true;
  }

  self.update = function(scene, delta) {
    
    self.accumulatedTime += delta;
    if (self.accumulatedTime < self.moveInterval) {
      return;
    }

    if (self.positions.length > self.expectedLifeChance) {
      self.finishPipe();
      return;
    }

    if (self.positions.length > 1) {
      var lastPosition = self.positions[self.positions.length - 2];
      var lastDirectionVector = new THREE.Vector3().subVectors(
        self.currentPosition,
        lastPosition
      );
    }

    var directionVector = new THREE.Vector3();
    var directionPool = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1)
    ];

    if (chance(1 / 2) && lastDirectionVector) {
      directionVector = lastDirectionVector;
    } else {
      // self.randomDirectionPool = shuffle(directionPool);
      // for (var i = 0; i < directionPool.length; i++) {
      //   var posToCheck = new THREE.Vector3().addVectors(
      //     self.currentPosition,
      //     self.randomDirectionPool[i]
      //   );

      //   if (getAt(posToCheck)) {
      //     continue;
      //   } else {
      //     self.hasOpenSpot = true;
      //     directionVector = self.randomDirectionPool[i];
      //     break;
      //   }
      // }
      
      var directionVector = new THREE.Vector3();
      directionVector[chooseFrom("xyz")] += chooseFrom([+1, -1]);
    }
    
    // if (!self.hasOpenSpot) {
    //   self.finishPipe();
    //   self.hasOpenSpot = true;
    //   return;
    // }

    var newPosition = new THREE.Vector3().addVectors(
      self.currentPosition,
      directionVector
    );

    // TODO: try other possibilities
    // ideally, have a pool of the 6 possible directions and try them in random order, removing them from the bag
    // (and if there's truly nowhere to go, maybe make a ball joint)
    if (!gridBounds.containsPoint(newPosition)) {
      return;
    }
    if (getAt(newPosition)) {
      return;
    }
    setAt(newPosition, self);

    // joint
    // (initial ball joint is handled elsewhere)
    if (lastDirectionVector && !lastDirectionVector.equals(directionVector)) {
      if (chance(options.ballJointChance)) {
        makeBallJoint(self.currentPosition, ballJointRadius);
      } else {
        makeElbowJoint(self.currentPosition, newPosition, lastDirectionVector);
      }
    }

    // pipe
    makeCylinderBetweenPoints(self.currentPosition, newPosition, self.material);

    // update
    self.currentPosition = newPosition;
    self.positions.push(newPosition);

    // var extrudePath = new THREE.CatmullRomCurve3(self.positions, false, "catmullrom");

    // var extrusionSegments = 10 * self.positions.length;
    // var radiusSegments = 10;
    // var tubeGeometry = new THREE.TubeBufferGeometry( extrudePath, extrusionSegments, pipeRadius, radiusSegments, false );

    // if(self.mesh){
    // 	self.object3d.remove(self.mesh);
    // }
    // self.mesh = new THREE.Mesh(tubeGeometry, self.material);
    // self.object3d.add(self.mesh);
    
    self.accumulatedTime -= self.moveInterval;
  };
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

var pipes = [];
var options = {
  initialAmount: CONFIG.START_PIPE_AMOUNT,
  texturePath: null,
  joints: CONFIG.PIPE_JOINTS_STYLE,
  interval: [20, 28], // range of seconds between fade-outs... Mostly for saftey in-case something weird happens.
};

var canvasContainer = document.getElementById("canvas-container");

// 2d canvas for dissolve effect
var canvas2d = document.getElementById("canvas-2d");
var ctx2d = canvas2d.getContext("2d");

// renderer
var canvasWebGL = document.getElementById("canvas-webgl");
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: canvasWebGL,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// camera
var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  100000
);

// controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enabled = false;

// scene
var scene = new THREE.Scene();
scene.background = null;

// lighting
var ambientLight = new THREE.AmbientLight(0x111111, CONFIG.AMBIENT_LIGHT_INTENSITY);
scene.add(ambientLight);

var directionalLightL = new THREE.DirectionalLight(0xffffff, CONFIG.DIRECT_LIGHT_INTENSITY);
directionalLightL.position.set(-1.2, 1.5, 0.5);
directionalLightL.castShadow = true;

// Increase shadow intensity (values > 1 make shadows darker/stronger)
directionalLightL.shadow.intensity = 1.5; 
scene.add(directionalLightL);

// fade out transition effect

var fadeOutOpacity = 0;
var fadeOutTransitionSeconds = 2;
var fadeOutElapsed = 0;
var fadeOutEndCallback;

// dissolve transition effect

var dissolveRects = [];
var dissolveRectsIndex = -1;
var dissolveRectsPerRow = 50;
var dissolveRectsPerColumn = 50;
var dissolveTransitionSeconds = 2;
var dissolveElapsed = 0;
var dissolveEndCallback;

function fadeOut(seconds, endCallback) {
  fadeOutTransitionSeconds = seconds;
  fadeOutElapsed = 0;
  fadeOutOpacity = 0;
  fadeOutEndCallback = endCallback;
}
function finishFadeOut() {
  allPipesDoneLock = false;
  fadeOutEndCallback();
  fadeOutOpacity = 0;
  ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
}

function dissolve(seconds, endCallback) {
  // TODO: determine rect sizes better and simplify
  // (silly approximation of squares of a particular size:)
  dissolveRectsPerRow = Math.ceil(window.innerWidth / 20);
  dissolveRectsPerColumn = Math.ceil(window.innerHeight / 20);

  dissolveRects = new Array(dissolveRectsPerRow * dissolveRectsPerColumn)
    .fill(null)
    .map(function(_null, index) {
      return {
        x: index % dissolveRectsPerRow,
        y: Math.floor(index / dissolveRectsPerRow),
      };
    });
  shuffleArrayInPlace(dissolveRects);
  dissolveRectsIndex = 0;
  dissolveTransitionSeconds = seconds;
  dissolveElapsed = 0;
  dissolveEndCallback = endCallback;
}
function finishDissolve() {
  allPipesDoneLock = false;
  dissolveEndCallback();
  dissolveRects = [];
  dissolveRectsIndex = -1;
  ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
}

var clearing = false;
var clearTID = -1;
function clear(fast) {
  clearTimeout(clearTID);
  clearTID = setTimeout(
    clear,
    random(options.interval[0], options.interval[1]) * 1000
  );
  if (!clearing) {
    clearing = true;
    var fadeOutTime = fast ? 0.2 : CONFIG.TRANSITION_SPEED;
    if (CONFIG.CURRENT_TRANSITION === TRANSITIONS.FADEOUT) {
      fadeOut(fadeOutTime, reset);
    } else if (CONFIG.CURRENT_TRANSITION === TRANSITIONS.DISSOLVE) {
      dissolve(fadeOutTime, reset);
    }
  }
}
clearTID = setTimeout(
  clear,
  random(options.interval[0], options.interval[1]) * 1000
);

function reset() {
  renderer.clear();

  for (var i = 0; i < pipes.length; i++) {
    disposePipe(pipes[i]);
    scene.remove(pipes[i].object3d);
  }
  pipes = [];
  clearGrid();
  centerCamera();

  clearing = false;
}

// this doesnt do shit
function disposePipe(pipe) {
  var geometries = new Set();
  var materials = new Set();

  pipe.object3d.traverse(function(object) {
    if (!object.isMesh) return;

    if (object.geometry) geometries.add(object.geometry);

    if (object.material) {
      var objectMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      objectMaterials.forEach(function(material) {
        materials.add(material);
      });
    }
  });

  geometries.forEach(function(geometry) {
    geometry.dispose();
  });

  materials.forEach(function(material) {
    material.dispose();
  });
}

var allPipesDoneLock = false;
const cameraDir = new THREE.Vector3();
const lightOffset = new THREE.Vector3(); 

// this function is executed on each animation frame
function animate() {
  var allPipesDone = true;
  const delta = clock.getDelta();
  const transitionDelta = Math.min(delta, 0.1);
  var jointType = options.joints;
  var ballJointChance = jointType === JOINT_TYPES.BALL ? 1 : jointType === JOINT_TYPES.MIXED ? 1 / 3 : 0;

  if (CONFIG.CAMERA_MOVEMENT == CAMERA_STATES.ORBIT) {
    controls.update(delta);
  }

  if (CONFIG.GIVE_CAMERA_FLASHLIGHT) {
    camera.getWorldDirection(cameraDir);
    directionalLightL.position.copy(camera.position);
    directionalLightL.target.position.copy(camera.position).add(
        cameraDir.multiplyScalar(0.05)
    );
  }

  if (options.texturePath && !textures[options.texturePath]) {
    var texture = THREE.ImageUtils.loadTexture(options.texturePath);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    textures[options.texturePath] = texture;
  }
  // update
  for (var i = 0; i < pipes.length; i++) {

    if (pipes[i].done != pipes[i].previousDone) {
      pipes[i].previousDone = pipes[i].done;

      var pipeOptions = {
        ballJointChance: ballJointChance,
        texturePath: options.texturePath,
        palette: CONFIG.SELECTED_PALETTE,
      };
      if (chance(1 / 2)) {
        pipes.push(new Pipe(scene, pipeOptions));
      }
    }

    if (pipes[i].done) {
      continue;
    }

    allPipesDone = false;
    pipes[i].update(scene, delta);
  }

  if (pipes.length > 0 && allPipesDone && !allPipesDoneLock) {
    allPipesDoneLock = true;
    clear();
  }

  if (pipes.length === 0) {
    var pipeOptions = {
      ballJointChance: ballJointChance,
      texturePath: options.texturePath,
        palette: CONFIG.SELECTED_PALETTE,
    };

    // texture loading example -- keeping
    // pipeOptions.texturePath = "images/textures/candycane.png";
    // // TODO: DRY
    // if (!textures[pipeOptions.texturePath]) {
    //   var texture = THREE.ImageUtils.loadTexture(pipeOptions.texturePath);
    //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //   texture.repeat.set(2, 2);
    //   textures[pipeOptions.texturePath] = texture;
    // }

    // TODO: create new pipes over time?
    for (var i = 0; i < options.initialAmount * (1 + chance(1 / 10)); i++) {
      pipes.push(new Pipe(scene, pipeOptions));
    }
  }

  if (!clearing) {
    renderer.render(scene, camera);
  }

  if (
    canvas2d.width !== window.innerWidth ||
    canvas2d.height !== window.innerHeight
  ) {
    canvas2d.width = window.innerWidth;
    canvas2d.height = window.innerHeight;
    // TODO: DRY!
    // actually: TODO: make the 2d canvas really low resolution, and stretch it with CSS, with pixelated interpolation
    if (dissolveRectsIndex > -1) {
      for (var i = 0; i < dissolveRectsIndex; i++) {
        var rect = dissolveRects[i];
        // TODO: could precompute rect in screen space, or at least make this clearer with "xIndex"/"yIndex"
        var rectWidth = innerWidth / dissolveRectsPerRow;
        var rectHeight = innerHeight / dissolveRectsPerColumn;
        ctx2d.fillStyle = CONFIG.ENABLE_PALETTE_BG_COLOR ? "#" + PALETTES[CONFIG.SELECTED_PALETTE].bg.toString(16) : "black";
        ctx2d.fillRect(
          Math.floor(rect.x * rectWidth),
          Math.floor(rect.y * rectHeight),
          Math.ceil(rectWidth),
          Math.ceil(rectHeight)
        );
      }
    }
  }
  if (CONFIG.CURRENT_TRANSITION === TRANSITIONS.DISSOLVE) {
    if (dissolveRectsIndex > -1) {
      dissolveElapsed = Math.min(
        dissolveElapsed + transitionDelta,
        dissolveTransitionSeconds
      );
      var targetRects = dissolveTransitionSeconds <= 0
        ? dissolveRects.length
        : Math.floor(
            dissolveRects.length * dissolveElapsed / dissolveTransitionSeconds
          );
      for (
        ;
        dissolveRectsIndex < targetRects && dissolveRectsIndex < dissolveRects.length;
      ) {
        var rect = dissolveRects[dissolveRectsIndex];
        // TODO: could precompute rect in screen space, or at least make this clearer with "xIndex"/"yIndex"
        var rectWidth = innerWidth / dissolveRectsPerRow;
        var rectHeight = innerHeight / dissolveRectsPerColumn;
        ctx2d.fillStyle = CONFIG.ENABLE_PALETTE_BG_COLOR ? "#" + PALETTES[CONFIG.SELECTED_PALETTE].bg.toString(16) : "black";
        ctx2d.fillRect(
          Math.floor(rect.x * rectWidth),
          Math.floor(rect.y * rectHeight),
          Math.ceil(rectWidth),
          Math.ceil(rectHeight)
        );
        dissolveRectsIndex += 1;
      }
      if (dissolveRectsIndex === dissolveRects.length) {
        finishDissolve();
      }
    }
  } else if (CONFIG.CURRENT_TRANSITION === TRANSITIONS.FADEOUT && clearing) {
    fadeOutElapsed = Math.min(
      fadeOutElapsed + transitionDelta,
      fadeOutTransitionSeconds
    );
    fadeOutOpacity = fadeOutTransitionSeconds <= 0
      ? 1
      : fadeOutElapsed / fadeOutTransitionSeconds;
    // hack - because the opacity darkesn way too fast ???
    if (fadeOutOpacity >= 0.4) {
      finishFadeOut();
    }
    ctx2d.fillStyle = "rgba(0, 0, 0, " + fadeOutOpacity + ")";
    ctx2d.fillRect(0, 0, canvas2d.width, canvas2d.height);
  }

  requestAnimationFrame(animate);
}

function centerCamera() {

  if (chance(1 / 2)) {
    // head-on view

    camera.position.set(0, 0, random(CONFIG.CAMERA_DISTANCE_MIN, CONFIG.CAMERA_DISTANCE_MAX));
  } else {
    // random view

    var vector = new THREE.Vector3(random(CONFIG.CAMERA_DISTANCE_MIN, CONFIG.CAMERA_DISTANCE_MAX), 0, 0);

    var axis = new THREE.Vector3(random(-1, 1), random(-1, 1), random(-1, 1));
    var angle = Math.PI / 2;
    var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);

    vector.applyMatrix4(matrix);
    camera.position.copy(vector);
  }
  var center = new THREE.Vector3(0, 0, 0);
  camera.lookAt(center);

  if (CONFIG.CAMERA_MOVEMENT === CAMERA_STATES.ORBIT) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = CONFIG.CAMERA_ORBIT_SPEED;
    controls.update();
  }
}
centerCamera();

addEventListener(
  "resize",
  function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  },
  false
);

canvasContainer.addEventListener(
  "contextmenu",
  function(e) {
    e.preventDefault();
  },
  false
);

// start animation
animate();

/**************\
|boring helpers|
\**************/
function random(x1, x2) {
  return Math.random() * (x2 - x1) + x1;
}
function randomInteger(x1, x2) {
  return Math.round(random(x1, x2));
}
function chance(value) {
  return Math.random() < value;
}
function chooseFrom(values) {
  return values[Math.floor(Math.random() * values.length)];
}
function shuffleArrayInPlace(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
function randomIntegerVector3WithinBox(box) {
  return new THREE.Vector3(
    randomInteger(box.min.x, box.max.x),
    randomInteger(box.min.y, box.max.y),
    randomInteger(box.min.z, box.max.z)
  );
}
function showElementsIf(selector, condition) {
  Array.from(document.querySelectorAll(selector)).forEach(function(el) {
    if (condition) {
      el.removeAttribute("hidden");
    } else {
      el.setAttribute("hidden", "hidden");
    }
  });
}
