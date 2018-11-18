if (WEBGL.isWebGLAvailable() === false) {

  document.body.appendChild(WEBGL.getWebGLErrorMessage());

}

var container, stats;
var params = {
  projection: 'normal',
  autoRotate: false,
  reflectivity: 1.0,
  background: false,
  exposure: 1.0,
  gemColor: 'Green'
};
var camera, scene, renderer, controls, objects = [];
var hdrCubeMap;
var composer;
var gemBackMaterial, gemFrontMaterial;
var hdrCubeRenderTarget;
var mouseX = 0,
  mouseY = 0;
var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight;
var windowHalfX = SCREEN_WIDTH / 2;
var windowHalfY = SCREEN_HEIGHT / 2;

init();
animate();

function init() {
  THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  container = document.createElement('div');

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0.0);
  document.getElementById('container').appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(1, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 5000;
  camera.position.y = 2000;
  scene.add(camera);


  gemBackMaterial = new THREE.MeshPhysicalMaterial({
    map: null,
    color: 0x888888,
    metalness: 1.0,
    roughness: 0,
    opacity: 0.5,
    side: THREE.BackSide,
    transparent: true,
    envMapIntensity: 5,
    premultipliedAlpha: true
    // TODO: Add custom blend mode that modulates background color by this materials color.
  });
  gemFrontMaterial = new THREE.MeshPhysicalMaterial({
    map: null,
    color: 0x888888,
    metalness: 0.0,
    roughness: 0,
    opacity: 0.15,
    side: THREE.FrontSide,
    transparent: true,
    envMapIntensity: 5,
    premultipliedAlpha: true
  });
  var manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
  };
  var loader = new THREE.OBJLoader(manager);

  // Import the model
  loader.load('models/new.obj', function (object) {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = gemBackMaterial;
        var second = child.clone();
        second.material = gemFrontMaterial;
        var parent = new THREE.Group();
        parent.add(second);
        parent.add(child);
        scene.add(parent);
        objects.push(parent);

      }
    });
  });

  var genCubeUrls = function (prefix, postfix) {
    return [
      prefix + 'px' + postfix, prefix + 'nx' + postfix,
      prefix + 'py' + postfix, prefix + 'ny' + postfix,
      prefix + 'pz' + postfix, prefix + 'nz' + postfix
    ];
  };

  //reflection map, I will try to change this later
  var hdrUrls = genCubeUrls("./textures/cube/pisaHDR/", ".hdr");
  new THREE.HDRCubeTextureLoader().load(THREE.UnsignedByteType, hdrUrls, function (hdrCubeMap) {

    var pmremGenerator = new THREE.PMREMGenerator(hdrCubeMap);
    pmremGenerator.update(renderer);

    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
    pmremCubeUVPacker.update(renderer);

    hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

    gemFrontMaterial.envMap = gemBackMaterial.envMap = hdrCubeRenderTarget.texture;
    gemFrontMaterial.needsUpdate = gemBackMaterial.needsUpdate = true;
    hdrCubeMap.dispose();
    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();

  });


  // Lights

  var pointLight1 = new THREE.PointLight(0xffffff);
  pointLight1.position.set(150, 10, 0);
  pointLight1.castShadow = false;
  scene.add(pointLight1);

  var pointLight2 = new THREE.PointLight(0xffffff);
  pointLight2.position.set(-150, 0, 0);
  scene.add(pointLight2);

  var pointLight3 = new THREE.PointLight(0xffffff);
  pointLight3.position.set(0, -10, -150);
  scene.add(pointLight3);

  var pointLight4 = new THREE.PointLight(0xffffff);
  pointLight4.position.set(0, 0, 150);
  scene.add(pointLight4);



  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;


  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  stats = new Stats();
  container.appendChild(stats.dom);

  // controls = new THREE.OrbitControls(camera, renderer.domElement);


  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  camera.updateProjectionMatrix();
  windowHalfX = SCREEN_WIDTH / 2;
  windowHalfY = SCREEN_HEIGHT / 2;

}



function animate() {

  requestAnimationFrame(animate);

  // stats.begin();
  render();
  // render();
  stats.update();
  // stats.end();

}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 10;
  mouseY = (event.clientY - windowHalfY) * 10;
}


function render() {

  renderer.toneMappingExposure = 1.5;
  camera.lookAt(scene.position);
  //Mouse rotation
  if (objects.length > 0) {
    var object = objects[0];
    object.rotation.y = mouseX / windowHalfX * 0.1 * Math.PI;
    object.rotation.x = -mouseY / windowHalfY * 0.1 * Math.PI;
  }
  renderer.render(scene, camera);

}