var raycaster;
var mouse;

var camera;
var controls;
var scene;
var renderer;
var container;
var textlabels=[];
var pressed = false;
// var intersects;

function init(){

  var container = document.getElementById( 'container' );
  document.body.appendChild( container );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 500;

  // world
  var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);

  for (var i = 0; i < 50; i++) {
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 1000;
    mesh.position.y = (Math.random() - 0.5) * 1000;
    mesh.position.z = (Math.random() - 0.5) * 1000;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);

    var text = createTextLabel();
    text.setHTML("Label "+i);
    text.setParent(mesh);
    textlabels.push(text);
    mesh.children = text.element;
    container.appendChild(text.element);
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x004477);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.enableDamping = false;
  // this.controls.dampingFactor =  0.25;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableKeys = true;
  //
  // animate
  //
  window.addEventListener( 'resize', onWindowResize, false );
	// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  // document.addEventListener('mousedown', onMouseDown, false);
  // document.addEventListener('mousemove', onDocumentMouseHover, false);
  document.addEventListener('mouseup', onDocumentMouseUp, false);

}

function onDocumentMouseUp ( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  pressed = true;
}

// function onDocumentMouseHover ( event ) {
//   event.preventDefault();
//   mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//   mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//   pressed = false;
// }

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
  controls.update();
	render();
}

function render(){

  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObjects( scene.children );

  for ( var i = 0; i < intersects.length; i++ ) {
    camera.position.set(intersects[ i ].object.position.x, intersects[ i ].object.position.y, intersects[ i ].object.position.z);
    controls.update();
  }

  for(var i=0; i<textlabels.length; i++) {
    textlabels[i].updatePosition();
  }

  renderer.render(scene, camera);

}

createTextLabel = function() {
  var div = document.createElement('div');
  div.className = 'text-label';
  div.style.position = 'absolute';
  div.style.width = 100;
  div.style.height = 100;
  div.innerHTML = "hi there!";
  div.style.top = -1000;
  div.style.left = -1000;
  // div.style.visibility = "hidden";

  return {
    element: div,
    parent: false,
    position: new THREE.Vector3(0,0,0),
    setHTML: function(html) {
      this.element.innerHTML = html;
    },
    setParent: function(threejsobj) {
      this.parent = threejsobj;
    },
    updatePosition: function() {
      if(parent) {
        this.position.copy(this.parent.position);
      }

      var coords2d = this.get2DCoords(this.position, camera);
      this.element.style.left = coords2d.x + 'px';
      this.element.style.top = coords2d.y + 'px';
    },
    get2DCoords: function(position, camera) {
      var vector = position.project(camera);
      vector.x = (vector.x + 1)/2 * window.innerWidth;
      vector.y = -(vector.y - 1)/2 * window.innerHeight;
      return vector;
    }
  };
},

init();
animate();
