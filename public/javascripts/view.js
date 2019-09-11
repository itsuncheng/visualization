var raycaster;
var mouse;

var camera;
var controls;
var scene;
var renderer;
var container;

var textlabels=[];

var scaleUp = 2000

wordsPoints = wordsPoints.slice(0,1000)
// console.log(wordsPoints);
// response_global = JSON.parse(response_global)
// console.log(response_global)

function init(){

  container = document.getElementById('container');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0,0,500);

  // world
  var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);

  for (var i = 0; i < wordsPoints.length; i++) {
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    var mesh = new THREE.Mesh(geometry, material);
    // console.log(Object.values(wordsPoints[i])[0]);
    mesh.position.x = Object.values(wordsPoints[i])[0][0] * scaleUp;
    mesh.position.y = Object.values(wordsPoints[i])[0][1] * scaleUp;
    mesh.position.z = Object.values(wordsPoints[i])[0][2] * scaleUp;
    
    scene.add(mesh);

    var text = createTextLabel();
    text.setHTML(Object.keys(wordsPoints[i])[0]);
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

  window.addEventListener( 'resize', onWindowResize, false);
  document.addEventListener('click', onClick, false);
  document.addEventListener('keydown', onKeyDown, false);

  console.log("scene.children: ", scene.children)
}


var addLineMode = false;
function onKeyDown(event){
  if(event.keyCode == 70){
    console.log("F is pressed!");
    addLineMode = true;
  }
}

var wordsSelected = 0;
var firstWordPos = undefined;
var secondWordPos = undefined;

var clickCount = 0;
var timeout = 250;
var currentLine = null;

function onClick(event) {
  if (addLineMode){
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );
    console.log(intersects.length)
    for(let i=0; i<intersects.length; i++){
      // console.log(intersects[i].object.visible);
      if(intersects[i].object.geometry.type == "CylinderGeometry" && intersects[i].object.visible){
        if (wordsSelected == 0){
          console.log("first word is selected");
          firstWordPos = intersects[i].object.position;
          wordsSelected +=1;
        }
        else if (wordsSelected == 1){
          console.log("second word is selected");
          secondWordPos = intersects[i].object.position;

          //remove current line
          if(currentLine != null){
            scene.remove(currentLine);
            currentLine = null;
          }
          
          //hide all similarity labels
          for(var j=0; j<similarityLabels.length; j++){
            similarityLabels[j].element.style.visibility = "hidden"
          }

          var geometry = new THREE.Geometry();
          geometry.vertices.push(new THREE.Vector3(firstWordPos.x, firstWordPos.y, firstWordPos.z));
          geometry.vertices.push(new THREE.Vector3(secondWordPos.x, secondWordPos.y, secondWordPos.z));
          var material = new THREE.LineBasicMaterial( { color: 0xffffff } );
          var line = new THREE.Line( geometry, material );
          scene.add( line );
          currentLine = line

          //post request
          firstWordPosList = Object.values(firstWordPos)
          secondWordPosList = Object.values(secondWordPos)
          console.log(textlabels.length)
          $.ajax({
            url: "/searchWord",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({"firstWordPosList": firstWordPosList, "secondWordPosList": secondWordPosList}),
            contentType: "application/json",
            cache: false,
            timeout: 5000,
            complete: function() {
              //called when complete
              wordsSelected = 0;
              addLineMode = false;
              console.log('process complete');
            },
        
            success: function(data) {
              console.log(data);
              var text = createTextLabel();
              text.setHTML(data.similarity);
              text.setParent(line);
              text.element.style.visibility = "visible"
              similarityLabels.push(text);
              line.children = text
              container.appendChild(text.element);
              console.log('process success');
           },
        
            error: function() {
              console.log('process error');
            },
          });
        }
        break;
      }
    }

  }else{
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
          for (let i=0; i<intersects.length; i++){
            if (intersects[i].object.geometry.type == "CylinderGeometry"){
              camera.position.set(intersects[i].object.position.x, intersects[i].object.position.y, intersects[i].object.position.z);
              camera.translateZ(130); // where `r` is the desired distance
              controls.update();
              break;
            }
          }
        } else {
          console.log('double click');
          for (let i=0; i<intersects.length; i++){
            if(intersects[i].object.geometry.type == "Geometry"){
              intersects[i].object.children.element.style.visibility = "hidden"
              scene.remove(intersects[i].object);
              break;
            }
          }
        }
  
        clickCount = 0;
      }, timeout);
    }
  }
}

function comparePos(prevMeshPos, cameraPos){
  if (!prevMeshPos){
    return false;
  }
  prevMeshPosVal = Object.values(prevMeshPos);
  cameraPosVal = Object.values(cameraPos);
  for (let i=0; i<prevMeshPosVal.length; i++){
    if (Math.abs(Math.round(prevMeshPosVal[i]) - Math.round(cameraPosVal[i])) > 2){
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
var resp = null;
var similarityLabels = []
function render(){

  for(var i=0; i<textlabels.length; i++) {
    textlabels[i].updatePosition();
  }
  for(var i=0; i<similarityLabels.length; i++) {
    similarityLabels[i].updatePosition();
  }
  
  if(response_global != null){
    resp = JSON.parse(response_global)
    response_global = null
    console.log(resp)
  }

  // using form
  if (resp != null){
    sessionid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    var index = 0
    var displayedWordsPos = []

    for(child of scene.children){
      child.visible = true
    }

    for(var i=0; i<textlabels.length; i++){
      textlabels[i].element.style.visibility = "visible"
    }

    //remove current line
    if(currentLine != null){
      scene.remove(currentLine);
      currentLine = null;
    }

    //hide all similarity labels
    for(var i=0; i<similarityLabels.length; i++){
      similarityLabels[i].element.style.visibility = "hidden"
    }


    for(child of scene.children){
      var child_position = child.position
      child_position = Object.values(child_position)
      child_position = child_position.map(function(x) { return x * scaleUp; });
      var allWordsNotInDisplay = true
      for (wordAndPos of resp.result){
        var pos = wordAndPos[1]
        if (comparePos(pos, child_position)){
          allWordsNotInDisplay = false
        }
      }

      if (allWordsNotInDisplay){
        child.visible = false
        textlabels[index].element.style.visibility = "hidden"
      }
      else {
        child.visible = true
        displayedWordsPos.push(child_position)
        textlabels[index].element.style.visibility = "visible"
      }

      index += 1
    }

    for(wordAndPos of resp.result){
      var word = wordAndPos[0]
      var pos = wordAndPos[1]

      wordInDisplay = false
      for (displayedPos of displayedWordsPos){
        if (comparePos(pos, displayedPos)){
          wordInDisplay = true
        }
      }

      if(!wordInDisplay){
        //create new mesh
        var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
        var material = new THREE.MeshBasicMaterial({
          color: 0xffffff
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = pos[0] * scaleUp;
        mesh.position.y = pos[1] * scaleUp;
        mesh.position.z = pos[2] * scaleUp;
        
        scene.add(mesh);

        var text = createTextLabel();
        text.setHTML(word);
        text.setParent(mesh);
        text.element.style.visibility = "visible"
        textlabels.push(text);

        container.appendChild(text.element);
      }
    }
    resp = null
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
  div.style.visibility = "visible";

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
