var raycaster;
var mouse;

var camera;
var controls;
var scene;
var renderer;
var container;

var words = ["coast",
            "womanly",
            "measly",
            "helpful",
            "effect",
            "muddled",
            "fragile",
            "cable",
            "dime",
            "infamous",
            "toad",
            "ill-fated",
            "describe",
            "imaginary",
            "abrupt",
            "even",
            "club",
            "wacky",
            "woebegone",
            "island",
            "suffer",
            "duck",
            "stocking",
            "sack",
            "year",
            "run",
            "deafening",
            "solid",
            "uncle",
            "humor"]
var textlabels=[];

function init(){

  container = document.getElementById('container');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0,0,500);

  // world
  var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);

  for (var i = 0; i < words.length; i++) {
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 1000;
    mesh.position.y = (Math.random() - 0.5) * 1000;
    mesh.position.z = (Math.random() - 0.5) * 1000;
    
    scene.add(mesh);

    var text = createTextLabel();
    text.setHTML(words[i]);
    text.setParent(mesh);
    textlabels.push(text);

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
  controls.enableDamping = true;
  // this.controls.dampingFactor =  0.25;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableKeys = true;

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener('click', onClick, false);

}

var clickCount = 0;
var timeout = 250;

var prevMeshPos = null;

function onClick(event) {
  clickCount++;
  if (clickCount == 1) {
    setTimeout(function () {
      event.preventDefault();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      raycaster.setFromCamera( mouse, camera );
      var intersects = raycaster.intersectObjects( scene.children );

      if (clickCount == 1) {
        console.log('singleClick');
        for (var i=0; i<intersects.length; i++){
          if (intersects[i].object.geometry.type == "CylinderGeometry"){
            camera.position.set(intersects[i].object.position.x, intersects[i].object.position.y, intersects[i].object.position.z);
            var vector = new THREE.Vector3(0, 0, -1);
            vector.applyQuaternion(camera.quaternion);
            camera.lookAt(vector);
            camera.updateProjectionMatrix();
            controls.update();
            prevMeshPos = intersects[i].object.position;
          }
        }
      } else {
        console.log('double click');
        for (var i=0; i<intersects.length; i++){
          console.log(JSON.stringify(prevMeshPos));
          console.log(JSON.stringify(camera.position));
          console.log(comparePos(prevMeshPos, camera.position));
          if (intersects[i].object.geometry.type == "CylinderGeometry" && comparePos(prevMeshPos, camera.position) ){
            console.log('Drawing a line...');
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(intersects[i].object.position.x,
              intersects[i].object.position.y, intersects[i].object.position.z));
            geometry.vertices.push(new THREE.Vector3( camera.position.x, camera.position.y, camera.position.z) );
            var material = new THREE.LineBasicMaterial( { color: 0xffffff } );
            var line = new THREE.Line( geometry, material );
            scene.add( line );
            break;
          }
        }
      }

      clickCount = 0;
    }, timeout);
  }
}

function comparePos(prevMeshPos, cameraPos){
  prevMeshPosVal = Object.values(prevMeshPos);
  cameraPosVal = Object.values(cameraPos);
  for (let i=0; i<prevMeshPosVal.length; i++){
    if (Number(parseFloat(prevMeshPosVal[i]).toFixed(4)) != Number(parseFloat(cameraPosVal[i]).toFixed(4))){
      return false;
    }
  }
  return true;
}


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

  for(var i=0; i<textlabels.length; i++) {
    textlabels[i].updatePosition();
  }

  renderer.render(scene, camera);

}

function createTextLabel() {
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
}

init();
animate();
