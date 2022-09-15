import * as THREE from './node_modules/three/build/three.module.js'

//create scene
let scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();

//create camera to view scene
//Left, Right, Top, Bottom, Near, Far
let scale = 24;
let aspectRatio = window.innerWidth / window.innerHeight;
let orthCamera = new THREE.OrthographicCamera(
-aspectRatio * scale / 2, aspectRatio * scale / 2, scale / 2, -scale / 2,
-1000,
1000);
orthCamera.position.set(0,0,0);

const devCamera = new THREE.PerspectiveCamera(
  75,
  aspectRatio,
  0.1,
  1000
);
devCamera.position.set(0,6,20);
devCamera.lookAt(0,0,0);

//renderer settings
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor('#ADD8E6')
renderer.setSize(window.innerWidth, window.innerHeight);
//creates a cavanvas object with the renderer settings
document.body.appendChild(renderer.domElement);
//when the window resolution changes, change the render settings to the new size
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    orthCamera.aspect = aspectRatio;
    orthCamera.updateProjectionMatrix();
})

//ambient light - lowest possible light level
//colour, intensity, distance, decay.
let ambient = new THREE.AmbientLight('#ffffff', 0.5);
scene.add(ambient);

//------------------------------------------------------------------------------

class floor {
    constructor(x, y, z, w, h, l) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, l),
            new THREE.MeshLambertMaterial( {color: 0xf0f0f0 } )
        );
        this.mesh.castShadow = true;
        this.mesh.recieveShadow = true;
        this.mesh.position.set(x, y, z);

        this.meshBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.meshBB.setFromObject(this.mesh);

        scene.add(this.mesh);
    }
}

class player {
    constructor(x, y, z, w, h, l) {
      this.geometry = new THREE.BoxGeometry(w, h, l),
      this.playerTexture = [
        new THREE.MeshStandardMaterial({ map: textureLoader.load('../img/moyaiRight.png')}),        //Left   pz
        new THREE.MeshStandardMaterial({ map: textureLoader.load('../img/moyaiLeft.png')}),         //Right  nz
        new THREE.MeshStandardMaterial({ map: textureLoader.load('../img/moyaiTopandBottom.png')}), //Top    py
        new THREE.MeshStandardMaterial({ map: textureLoader.load('../img/moyaiTopandBottom.png')}), //Bottom ny
        new THREE.MeshStandardMaterial({ map: textureLoader.load('../img/moyaiFront.png')}),        //Front  px
        new THREE.MeshStandardMaterial({ map: textureLoader.load('../img/moyaiBack.png')}),         //Back   nx
      ];
      this.mesh = new THREE.Mesh(this.geometry, this.playerTexture);
      this.mesh.castShadow = true;
      this.mesh.position.set(x, y, z);

      this.meshBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
      this.meshBB.setFromArray(this.mesh);

      scene.add(this.mesh);
    }
}

const player1 = new player(0, 4, 0, 1, 1, 1);
const floor1 = new floor(0, -2, 0, 4, 1, 4);
const floor2 = new floor(-8, 1, 5, 2, 1, 2);
const floor3 = new floor(12, 3, 9, 2, 1, 2);
const floor4 = new floor(0, 6, 0, 12, 1, 12);

//------------------------------------------------------------------------------
//functions
const floorObj = [floor1.meshBB, floor2.meshBB, floor3.meshBB, floor4.meshBB];

let gravity = true;
let onGround = false;
let isJumping = false;
let jumpCount = 0;
let wDown = false;
let sDown = false;
let aDown = false;
let dDown = false;
let qDown = false;
let eDown = false;
let spaceDown = false;
let speed = 0.2;


function movementZpos(){
  if(aDown === true) {
      player1.mesh.position.x -= 1* speed;
      orthCamera.position.x -= 1* speed;
  };
  if(dDown === true) {
      player1.mesh.position.x += 1* speed;
      orthCamera.position.x += 1* speed;
  };
}

function movementZneg(){
  if(aDown === true) {
      player1.mesh.position.x += 1* speed;
      orthCamera.position.x += 1* speed;
  };
  if(dDown === true) {
      player1.mesh.position.x -= 1* speed;
      orthCamera.position.x -= 1* speed;
  };
}

function movementXpos(){
  if(aDown === true) {
      player1.mesh.position.z += 1* speed;
      orthCamera.position.z += 1* speed;
  };
  if(dDown === true) {
      player1.mesh.position.z -= 1* speed;
      orthCamera.position.z -= 1* speed;
  };
}

function movementXneg(){
  if(aDown === true) {
      player1.mesh.position.z -= 1* speed;
      orthCamera.position.z -= 1* speed;
  };
  if(dDown === true) {
      player1.mesh.position.z += 1* speed;
      orthCamera.position.z += 1* speed;
  };
}

const cameraState = [1, 2, 3, 4];
let cameraCounter = 0;

function cCountController(){
if (cameraCounter === 4){
  cameraCounter = 0;
}
if (cameraCounter === -1){
  cameraCounter = 3;
}
console.log(cameraState[cameraCounter]);
}

//makes radians normal numbers instead of stuipid math
function radToDeg ( degrees ) {
  return degrees * (Math.PI / 180);
}

function deathCheck(){
  if(player1.mesh.position.y < -20){
    player1.mesh.position.set(0, 4, 0);
    orthCamera.position.set(0, 0, 0);
  } 
}

function checkCollision(){
  onGround = false;
  gravity = true;
  floorObj.forEach(instance => {
    if (player1.meshBB.intersectsBox(instance) && !(player1.mesh.position.y < instance.max.y)){
      //console.log("i am grounded")
      onGround = true;
      jumpCount = 0;
      gravity = false;
    }
  })
}

function yump(){
  if(onGround === true && spaceDown === true){
    isJumping = true;
  }
  if(jumpCount<15 && isJumping === true){
    player1.mesh.position.y += 0.25
    jumpCount +=1
  } else if(jumpCount >= 15){
    isJumping = false;
  }
}

function grav(){
  if(onGround === false && isJumping === false){
    player1.mesh.position.y -= 0.25
  }
}

//grav = number^index
// index = index + 1
//ifgrounded index = 0;

//------------------------------------------------------------------------------


window.addEventListener('keyup', (e) => {
    switch (e.keyCode){
      case 87: // w
        wDown = false;
        break;
      case 65: // a
        aDown = false;
        break;
      case 83: // s
        sDown = false;
        break;
      case 68: // d
        dDown = false;
        break;
      case 32: // space
        spaceDown = false;
        break;
      case 81: // q
        qDown = false;    
        orthCamera.rotateY(radToDeg(-90));
        cameraCounter -= 1;
        console.log("q")
        break;
      case 69: // e
        eDown = false;
        orthCamera.rotateY(radToDeg(90));
        cameraCounter += 1;
        console.log("e")
        break;
    }
});
  window.addEventListener('keydown', (e) => {
    switch (e.keyCode){
      case 87: // w
        wDown = true;
        console.log("w")
        break;
      case 65: // a
        aDown = true;
        console.log("a")
        break;
      case 83: // s
        sDown = true;
        console.log("s")
        break;
      case 68: // d
        dDown = true;
        console.log("d")
        break;
      case 32: // space
        spaceDown = true;
        console.log("space")
        break;
      case 81: // q
        qDown = true;
        console.log("q")
        break;
      case 69: // e
        eDown = true;
        console.log("e")
        break;
    }
});

function movementOverall(){
  if(cameraCounter == 0){
    movementZpos()
  }
  else if(cameraCounter == 1){
    movementXpos()
  }
  else if(cameraCounter == 2){
    movementZneg()
  }
  else if(cameraCounter == 3){
    movementXneg()
  }
}

//------------------------------------------------------------------------------

function animate() {
  renderer.render(scene, orthCamera);
  player1.meshBB.setFromObject(player1.mesh);

  checkCollision();
  movementOverall();

  grav();
  yump();
  cCountController();
  deathCheck();

  requestAnimationFrame(animate);
};
animate();