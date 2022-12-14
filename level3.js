import * as THREE from './three.module.js'

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
renderer.setClearColor('#b9ffff')
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
let ambient = new THREE.AmbientLight('#ffffff', 1);
scene.add(ambient);

//------------------------------------------------------------------------------

class floor {
    constructor(x, y, z, w, h, l, col) {
      this.mesh = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, l),
          new THREE.MeshLambertMaterial( {color: col } )
      );
    this.w = w;
    this.h = h;
    this.l = l;

    this.x = x;
    this.y = y;
    this.z = z;

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
      new THREE.MeshStandardMaterial({ map: textureLoader.load('moyaiRight.png')}),        //Left   pz
      new THREE.MeshStandardMaterial({ map: textureLoader.load('moyaiLeft.png')}),         //Right  nz
      new THREE.MeshStandardMaterial({ map: textureLoader.load('moyaiTopandBottom.png')}), //Top    py
      new THREE.MeshStandardMaterial({ map: textureLoader.load('moyaiTopandBottom.png')}), //Bottom ny
      new THREE.MeshStandardMaterial({ map: textureLoader.load('moyaiFront.png')}),        //Front  px
      new THREE.MeshStandardMaterial({ map: textureLoader.load('moyaiBack.png')}),         //Back   nx
    ];
    this.mesh = new THREE.Mesh(this.geometry, this.playerTexture);
    this.mesh.castShadow = true;
    this.mesh.position.set(x, y, z);

    this.meshBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    this.meshBB.setFromArray(this.mesh);

    scene.add(this.mesh);
  }
}

const player1 = new player(0, 2, 0, 1, 1, 1);
const floor1 = new floor(0, -2, 0, 4, 1, 4, 0x808080);
const portalA1 = new floor(3, 1, 0, 0.75, 1.5, 0.75, 0x50C878);
const portalA2 = new floor(-3, 1, 8, 0.75, 1.5, 0.75, 0x50C878);


//invisible is 0xb9ffff
//const winCon = new floor(0, 11, 0, 0.5, 0.5, 0.5, 0xff0000);

//------------------------------------------------------------------------------
//functions
const floorObj = [floor1];
const portalObj = [portalA1, portalA2]
const thud = new Audio("vineboom.mp3");
const aughh = new Audio("Aughh.mp3")

let gravity = true;
let onGround = false;
let isJumping = false;
let jumpCount = 0;
let canRotate = true;
let isRotatingQ = false;
let isRotatingE = false;
let buttonPressed = false;
let rotCount = 0;
let rotCount2 = 0;
let wDown = false;
let sDown = false;
let aDown = false;
let dDown = false;
let qDown = false;
let eDown = false;
let spaceDown = false;
let lArrow = false;
let rArrow = false;
let upArrow = false;
let haswon = false;
let lightningCount = 0;
let teleportSickness = false;
let speed = 0.2;

function adjustCameraPos(){
  orthCamera.position.x = player1.mesh.position.x;
  orthCamera.position.z = player1.mesh.position.z;
}

function movementZpos(){
  if(aDown === true || lArrow === true) {
      player1.mesh.position.x -= 1* speed;
  };
  if(dDown === true || rArrow === true) {
      player1.mesh.position.x += 1* speed;
  };
}

function movementZneg(){
  if(aDown === true || lArrow === true) {
      player1.mesh.position.x += 1* speed;
  };
  if(dDown === true || rArrow === true) {
      player1.mesh.position.x -= 1* speed;
  };
}

function movementXpos(){
  if(aDown === true || lArrow === true) {
      player1.mesh.position.z += 1* speed;
  };
  if(dDown === true || rArrow === true) {
      player1.mesh.position.z -= 1* speed;
  };
}

function movementXneg(){
  if(aDown === true || lArrow === true) {
      player1.mesh.position.z -= 1* speed;
  };
  if(dDown === true || rArrow === true) {
      player1.mesh.position.z += 1* speed;
  };
}

function expandX(){
  if(cameraState[cameraCounter] == 2 || cameraState[cameraCounter] == 4){
    floorObj.forEach(instance => {
      instance.meshBB.max.setX(100);
      instance.meshBB.min.setX(-100);      
      instance.meshBB.max.setZ(instance.z + instance.l/2);
      instance.meshBB.min.setZ(instance.z - instance.l/2);
    })
    portalObj.forEach(instance => {
      instance.meshBB.max.setX(100);
      instance.meshBB.min.setX(-100);      
      instance.meshBB.max.setZ(instance.z + instance.l/2);
      instance.meshBB.min.setZ(instance.z - instance.l/2);
    })
  }
}

function buttonLogic(){
  if(player1.meshBB.intersectsBox(button1.meshBB)){
    buttonPressed = true;
  }if(buttonPressed == true){
    //floor6(-16, 4, 7, 2, 1, 2, 0x808080);
    floor6.mesh.position.y = 4
    floor6.meshBB.setFromObject(floor6.mesh);
    winCon.mesh.position.y = 5
    winCon.meshBB.setFromObject(winCon.mesh);
  } else if(buttonPressed == false){
    floor6.mesh.position.y = 100
    floor6.meshBB.setFromObject(floor6.mesh);
    winCon.mesh.position.y = 100
    winCon.meshBB.setFromObject(winCon.mesh);
  }
}

function expandZ(){
  if(cameraState[cameraCounter] == 1 || cameraState[cameraCounter] == 3){
    floorObj.forEach(instance => {
      instance.meshBB.max.setZ(100);
      instance.meshBB.min.setZ(-100);      
      instance.meshBB.max.setX(instance.x + instance.w/2);
      instance.meshBB.min.setX(instance.x - instance.w/2);
    })
    portalObj.forEach(instance => {
      instance.meshBB.max.setZ(100);
      instance.meshBB.min.setZ(-100);      
      instance.meshBB.max.setX(instance.x + instance.w/2);
      instance.meshBB.min.setX(instance.x - instance.w/2);
    })
  }
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
    player1.mesh.position.set(0, 2, 0);
    orthCamera.position.set(0, 0, 0);
    buttonPressed = false;
  } 
}

function checkCollision(){
  onGround = false;
  gravity = true;
  floorObj.forEach(instance => {
    if (player1.meshBB.intersectsBox(instance.meshBB) && !(player1.mesh.position.y < instance.meshBB.max.y)){
      if(cameraState[cameraCounter] == 1 || cameraState[cameraCounter] == 3){
      player1.mesh.position.z = instance.z
      }
      if(cameraState[cameraCounter] == 2 || cameraState[cameraCounter] == 4){
        player1.mesh.position.x = instance.x
      }
      onGround = true;
      gravity = false;
      teleportSickness = false;
      if(isJumping == false){
        jumpCount = 0;
      }
    }
  })
}

function yump(){
  if(onGround === true && (spaceDown === true || wDown === true || upArrow === true)){
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
    // RAHHHHh
  }
}

function cameraRot(){
//q
  if(qDown == true && canRotate == true){
    thud.play();
    isRotatingQ = true;
    canRotate = false;
  }
  if(rotCount < 9 && isRotatingQ == true){
    orthCamera.rotateY(radToDeg(-10));
    rotCount += 1;
    
  } else if(rotCount >= 9){
    isRotatingQ = false;
    rotCount = 0
    cameraCounter -= 1;
    canRotate = true;
    
  }
  //e
  if(eDown == true && canRotate == true){
    thud.play();
    isRotatingE = true;
    canRotate = false;
  }
  if(rotCount2 < 9 && isRotatingE == true){
    orthCamera.rotateY(radToDeg(10));
    rotCount2 += 1;
  } else if(rotCount2 >= 9){
    isRotatingE = false;
    rotCount2 = 0
    cameraCounter += 1;
    canRotate = true;
  }
}

function lightning(){
  lightningCount += 1
  //console.log(lightningCount)
  if(lightningCount > 150){
    renderer.setClearColor(0xffffff)
    if(lightningCount > 225){
      lightningCount = 0;
    }
  }else {
    renderer.setClearColor(0xb9ffff)
  }
}

function teleportA(){
  if(player1.meshBB.intersectsBox(portalA1.meshBB) && teleportSickness === false){
    player1.mesh.position.x = portalA2.x;
    player1.mesh.position.z = portalA2.z;
    player1.mesh.position.y = portalA2.y;
    teleportSickness = true;
  }
  if(player1.meshBB.intersectsBox(portalA2.meshBB) && teleportSickness === false){
    player1.mesh.position.x = portalA1.x;
    player1.mesh.position.z = portalA1.z;
    player1.mesh.position.y = portalA1.y;
    teleportSickness = true;
  }
}

function win(){
  if(player1.meshBB.intersectsBox(winCon.meshBB) && haswon == false){
    window.location.href = "./levelselect.html"
    aughh.play();
    haswon = true;
  }
}

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
        //orthCamera.rotateY(radToDeg(-90));
        //cameraCounter -= 1;
        console.log("q")
        break;
      case 69: // e
        eDown = false;
        //orthCamera.rotateY(radToDeg(90));
        //cameraCounter += 1;
        console.log("e")
      break;
        case 37: //left arrow
        lArrow = false;
        break;
      case 	39: //right arrow
        rArrow = false;
        break;
      case 38: // up arrow
        upArrow = false;
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
      case 37: //left arrow
        lArrow = true;
        console.log("left")
        break;
      case 	39: //right arrow
        rArrow = true;
        console.log("right")
        break;
      case 38: // up arrow
        upArrow = true;
        console.log("up")
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
  //lightning();
  cameraRot();

  teleportA();
  //buttonLogic();
  expandZ();
  expandX();
  checkCollision();
  movementOverall();

  adjustCameraPos();

  grav();
  yump();
  cCountController();
  deathCheck();
  //win();

  requestAnimationFrame(animate);
};
animate();