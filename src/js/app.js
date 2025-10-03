import * as THREE from 'three';
import {TimelineMax} from 'gsap';
import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

// Create video elements with proper setup
let video1 = document.createElement('video');
video1.src = 'vids/snow.mp4';
video1.loop = true;
video1.muted = true;
video1.playsInline = true;
video1.autoplay = true;
video1.preload = 'auto';
video1.crossOrigin = 'anonymous';
video1.load(); // Force immediate loading

let video2 = document.createElement('video');
video2.src = 'vids/bird.mp4';
video2.loop = true;
video2.muted = true;
video2.playsInline = true;
video2.autoplay = true;
video2.preload = 'auto';
video2.crossOrigin = 'anonymous';
video2.load(); // Force immediate loading

let video3 = document.createElement('video');
video3.src = 'vids/sakura.mp4';
video3.loop = true;
video3.muted = true;
video3.playsInline = true;
video3.autoplay = true;
video3.preload = 'auto';
video3.crossOrigin = 'anonymous';
video3.load(); // Force immediate loading

let video4 = document.createElement('video');
video4.src = 'vids/beach.mp4';
video4.loop = true;
video4.muted = true;
video4.playsInline = true;
video4.autoplay = true;
video4.preload = 'auto';
video4.crossOrigin = 'anonymous';
video4.load(); // Force immediate loading

// Create video textures with proper settings BEFORE event listeners
let videoTexture1 = new THREE.VideoTexture(video1);
videoTexture1.minFilter = THREE.LinearFilter;
videoTexture1.magFilter = THREE.LinearFilter;
videoTexture1.format = THREE.RGBFormat;
videoTexture1.needsUpdate = true;

let videoTexture2 = new THREE.VideoTexture(video2);
videoTexture2.minFilter = THREE.LinearFilter;
videoTexture2.magFilter = THREE.LinearFilter;
videoTexture2.format = THREE.RGBFormat;
videoTexture2.needsUpdate = true;

let videoTexture3 = new THREE.VideoTexture(video3);
videoTexture3.minFilter = THREE.LinearFilter;
videoTexture3.magFilter = THREE.LinearFilter;
videoTexture3.format = THREE.RGBFormat;
videoTexture3.needsUpdate = true;

let videoTexture4 = new THREE.VideoTexture(video4);
videoTexture4.minFilter = THREE.LinearFilter;
videoTexture4.magFilter = THREE.LinearFilter;
videoTexture4.format = THREE.RGBFormat;
videoTexture4.needsUpdate = true;

// Track video loading state
let videosLoaded = 0;
const totalVideos = 4;

function checkAllVideosLoaded() {
  videosLoaded++;
  console.log(`Video ${videosLoaded}/${totalVideos} loaded`);
  if (videosLoaded === totalVideos) {
    console.log('All videos loaded and ready!');
  }
}

// Ensure videos are ready and playing
video1.addEventListener('loadeddata', function() {
  console.log('Video1 (snow) loaded and ready');
  videoTexture1.needsUpdate = true;
  checkAllVideosLoaded();
});

video2.addEventListener('loadeddata', function() {
  console.log('Video2 (bird) loaded and ready');
  videoTexture2.needsUpdate = true;
  checkAllVideosLoaded();
});

video3.addEventListener('loadeddata', function() {
  console.log('Video3 (sakura) loaded and ready');
  videoTexture3.needsUpdate = true;
  checkAllVideosLoaded();
});

video4.addEventListener('loadeddata', function() {
  console.log('Video4 (beach) loaded and ready');
  videoTexture4.needsUpdate = true;
  checkAllVideosLoaded();
});

// Add canplay event listeners for better readiness
video1.addEventListener('canplay', function() {
  videoTexture1.needsUpdate = true;
});
video2.addEventListener('canplay', function() {
  videoTexture2.needsUpdate = true;
});
video3.addEventListener('canplay', function() {
  videoTexture3.needsUpdate = true;
});
video4.addEventListener('canplay', function() {
  videoTexture4.needsUpdate = true;
});

// Start playing videos immediately
video1.play().catch(e => console.log('Video1 autoplay:', e));
video2.play().catch(e => console.log('Video2 autoplay:', e));
video3.play().catch(e => console.log('Video3 autoplay:', e));
video4.play().catch(e => console.log('Video4 autoplay:', e));

let gallery = [
  videoTexture1, // snow.mp4
  videoTexture2, // bird.mp4
  videoTexture3, // sakura.mp4
  videoTexture4 // beach.mp4
];

let camera, scene, renderer, material, plane;

function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerWidth);

  var container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.001, 100
  );
  camera.position.set( 0, 0, 1 );


  // controls = new OrbitControls(camera, renderer.domElement);


  material = new THREE.ShaderMaterial( {
    side: THREE.DoubleSide,
    uniforms: {
      time: { type: 'f', value: 0 },
      pixels: {type: 'v2', value: new THREE.Vector2(window.innerWidth,window.innerHeight)},
      accel: {type: 'v2', value: new THREE.Vector2(0.5,2)},
      progress: {type: 'f', value: 0},
      uvRate1: {
        value: new THREE.Vector2(1,1)
      },
      texture1: {
        value: videoTexture4 // Start with beach.mp4
      },
      texture2: {
        value: videoTexture1 // Start with snow.mp4
      },
    },
    // wireframe: true,
    vertexShader: vertex,
    fragmentShader: fragment
  });

  plane = new THREE.Mesh(new THREE.PlaneGeometry( 1,1, 1, 1 ),material);
  scene.add(plane);

  resize();


}

window.addEventListener('resize', resize);
function resize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  renderer.setSize( w, h );
  camera.aspect = w / h;

  material.uniforms.uvRate1.value.y = h / w;

  // calculate scene
  let dist  = camera.position.z - plane.position.z;
  let height = 1;
  camera.fov = 2*(180/Math.PI)*Math.atan(height/(2*dist));

  // if(w/h>1) {
  plane.scale.x = w/h;
  // }



  camera.updateProjectionMatrix();
}

let time = 0;
function animate() {
  time = time+0.05;
  material.uniforms.time.value = time;

  requestAnimationFrame(animate);
  render();
}

function render() {
  // Update video textures only when videos are ready
  if (video1.readyState >= video1.HAVE_CURRENT_DATA) {
    videoTexture1.needsUpdate = true;
  }
  if (video2.readyState >= video2.HAVE_CURRENT_DATA) {
    videoTexture2.needsUpdate = true;
  }
  if (video3.readyState >= video3.HAVE_CURRENT_DATA) {
    videoTexture3.needsUpdate = true;
  }
  if (video4.readyState >= video4.HAVE_CURRENT_DATA) {
    videoTexture4.needsUpdate = true;
  }

  renderer.render(scene, camera);
}


init();
animate();

// Ensure videos play on any user interaction
document.addEventListener('click', function() {
  if (video1.paused) video1.play();
  if (video2.paused) video2.play();
  if (video3.paused) video3.play();
  if (video4.paused) video4.play();
}, { once: true });

// Also try on scroll
document.addEventListener('wheel', function() {
  if (video1.paused) video1.play();
  if (video2.paused) video2.play();
  if (video3.paused) video3.play();
  if (video4.paused) video4.play();
}, { once: true });

/// SCROLL MAGIC
let speed = 0;
let position = 0;
document.addEventListener('wheel',function(event) {
  speed += event.deltaY*0.00015; // Sweet spot between 0.0001 and 0.0002
});

// Helper function to properly handle modulo for negative numbers
function mod(n, m) {
  return ((n % m) + m) % m;
}

let tl1 = new TimelineMax();
function raf() {
  position += speed;
  speed *=0.7;

  // Always settle toward the nearest page with smart threshold-based snapping
  // If past halfway (0.5), settle forward; otherwise settle back
  let fractionalPart = position - Math.floor(position);
  let targetPosition;

  if (fractionalPart > 0.5) {
    // Past halfway, settle to next page (round up)
    targetPosition = Math.ceil(position);
  } else {
    // Before halfway, settle to current page (round down)
    targetPosition = Math.floor(position);
  }

  let dif = targetPosition - position;

  // Minimal settling force - very gentle resistance
  let settleStrength = 0.005 + (1 - Math.min(Math.abs(speed) * 100, 1)) * 0.01;
  position += dif * settleStrength;

  // Snap to target when very close
  if(Math.abs(dif) < 0.001) {
    position = targetPosition;
  }



  tl1.set('.dot',{y:position*200});

  // Keep position as-is for the shader - it handles the transitions
  material.uniforms.progress.value = position;


  // Use proper modulo function for negative numbers to get slide indices
  let curslide = mod(Math.floor(position), gallery.length);
  let nextslide = mod(Math.floor(position) + 1, gallery.length);

  console.log('position:', position.toFixed(2), 'curslide:', curslide, 'nextslide:', nextslide);

  material.uniforms.texture1.value = gallery[curslide];
  material.uniforms.texture2.value = gallery[nextslide];

  // Ensure videos are playing when they're being used
  const videos = [video1, video2, video3, video4];
  if (videos[curslide] && videos[curslide].paused) {
    videos[curslide].play().catch(e => console.log(`Video ${curslide + 1} play error:`, e));
  }
  if (videos[nextslide] && videos[nextslide].paused) {
    videos[nextslide].play().catch(e => console.log(`Video ${nextslide + 1} play error:`, e));
  }

  // console.log(speed,position);
  window.requestAnimationFrame(raf);
}

raf();





