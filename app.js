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
  renderer.toneMappingExposure = 1;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(1, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
  camera.position.z = 5000;
  camera.position.y = 2000;
  scene.add(camera);

  var manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
  };


  const alphaMap = new THREE.TextureLoader().load(
    "models/alpha_map.jpg"
  );
  const emerald1 = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,

    metalness: 0.1,
    // roughness: 0.6,

    side: THREE.BackSide
  });
  const emerald2 = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,

    alphaMap: alphaMap,
    transparent: true,
    alphaTest: 0,
    // opacity: 0.8,
    side: THREE.FrontSide

  });
  emerald2.alphaMap.magFilter = THREE.NearestFilter;
  emerald2.clearCoat = 1;
  emerald2.clearCoatRoughness = 0;
  emerald2.reflectivity = 1;

  var loader = new THREE.OBJLoader(manager);
  new THREE.OBJLoader()
    .load('models/new.obj', function (object) {
      // object.position.y = - 95;
      // object.scale.setScalar(2);
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          // child.material = emerald;
          child.material = emerald2;
          var second = child.clone();
          second.material = emerald1;
          var parent = new THREE.Group();
          parent.add(second);
          parent.add(child);
          parent.scale.x = parent.scale.y = parent.scale.z = SCREEN_WIDTH / SCREEN_HEIGHT * 0.4;
          scene.add(parent);
          objects.push(parent);
        }
        var geom = new THREE.IcosahedronGeometry(15, 1);
        var mat = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          wireframe: true,
          side: THREE.DoubleSide

        });

        object.scale.x = object.scale.y = object.scale.z = SCREEN_WIDTH / SCREEN_HEIGHT * 0.4;
        var planet = new THREE.Mesh(geom, mat);
        planet.scale.x = planet.scale.y = planet.scale.z = SCREEN_WIDTH / SCREEN_HEIGHT * 1.2;
        scene.add(planet);
        scene.add(object);
        objects.push(object);
        objects.push(planet);
      });
    });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;


  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  stats = new Stats();
  container.appendChild(stats.dom);

  controls = new THREE.OrbitControls(camera, renderer.domElement);



  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);

  addLights();
}

function update() {
  console.log(licolor1);
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

function addLights() {

  var shadowLight = new THREE.DirectionalLight(0xffffff, 0.2);
  shadowLight.position.set(20, 10, 40);
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  var ambientLight2 = new THREE.AmbientLight(0xf1a4ff, 0.2);
  var light1 = new THREE.PointLight(0xff5de0, 0.7, 1500);
  light1.position.set(0, 0, -50);
  var light2 = new THREE.PointLight(0x0065b4, 0.7, 1500);
  light2.position.set(140, 140, 10);
  var light3 = new THREE.PointLight(0x6834a1, 0.7, 1500);
  light3.position.set(-100, -50, -20);
  var light4 = new THREE.PointLight(0x5854ff, 0.7, 1500);
  light4.position.set(-100, 80, -20);
  var light5 = new THREE.PointLight(0x117eff, 0.7, 1500);
  light5.position.set(100, -20, 30);
  var light6 = new THREE.PointLight(0x00205c, 0.7, 1500);
  light6.position.set(-40, 0, 130);
  scene.add(shadowLight, ambientLight, ambientLight2, light1, light2, light3, light4, light5, light6);

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

  // renderer.toneMappingExposure = 1.5;
  camera.lookAt(scene.position);

  //Mouse rotation
  for (i = 0; i < objects.length; i++) {
    var object = objects[i];
    object.rotation.y = object.rotation.y * 0.95 + mouseX / windowHalfX * 0.1 * Math.PI * 0.05;
    object.rotation.x = object.rotation.x * 0.95 - mouseY / windowHalfY * 0.1 * Math.PI * 0.05;
  }
  renderer.render(scene, camera);

}