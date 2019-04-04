function main() {

    console.warn = function () { }; // now warnings do nothing!
    //state object for holding important values
    var state = {
        objects: [],
        models: [],
        lights: [],
        ship: null,
        collidableObjects: [],
        selectedIndex: 0,
        camera: null,
        scene: null,
        flySpeed: 0.5,
        healthVal: 100,
        mouseX: 0,
        mouseY: 0,
        moving: true,
        finishedLoad: false,
        invincible: false,
        invincibleTime: 0,
        canal: {
            x0: 40,
            x1: -40,
            y0: 40
        },
        flySoundPlaying: false,
        flySounds: [],
        flySoundsPaths: [
            'sounds/TIE-Fly1.wav',
            'sounds/TIE-Fly2.wav',
            'sounds/TIE-Fly3.wav',
            'sounds/TIE-Fly4.wav',
            'sounds/TIE-Fly5.wav',
            'sounds/TIE-Fly6.wav',
            'sounds/TIE-Fly7.wav'],
        powerUpObjects: [],
        movingAsteroids: [],
        videoDonePlaying: false,
        collisionMade: false,
        introDone: false,
        musicStarted: false,
        gameStarted: false
        

    }

    let clock = new THREE.Clock();
    //console.log(clock);
    state.clock = clock;

    //create scene and camera
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var listener = new THREE.AudioListener();
    camera.add(listener);
    state.listener = listener;

    var sound = new THREE.Audio(state.listener);
    var audioLoader = new THREE.AudioLoader();

    state.audioLoader = audioLoader;

    camera.position.z = -5;
    camera.position.y = 1;
    state.scene = scene;
    state.camera = camera;

    //create white pointlight
    createLight(state, scene, false, 0, 100, 5);
    createLight(state, scene, true, 0, 50, 5);
    createLight(state, scene, false, 0, 50, 70);
    createLight(state, scene, false, -70, 100, 5);

    var AmbientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(AmbientLight);

    //create renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);

    let healthText = document.getElementById("healthVal");
    let tieVideo = document.getElementById('tieVideo');
    let introVideo = document.getElementById('introVideo');
    let scoreText = document.getElementById("scoreVal");
    let skipButton = document.getElementById("skipIntroButton");
    let startButton = document.getElementById("startButton");

    state.startButton = startButton;

    startButton.style.display = "none";

    skipButton.onclick = function () {
        introVideo.currentTime = introVideo.duration;
        skipButton.style.display = "none";
        startButton.style.display = "inline";
    };

    startButton.onclick = function () {
        state.gameStarted = true;
        startButton.style.display = "none";

    };


    introVideo.style.display = "inline";
    introVideo.style.width = "100%";
    introVideo.style.height = "100%";
    introVideo.style.position = "absolute";


    introVideo.play();

    //introVideo.muted = false;

    state.scoreVal = 0;
    scoreText.textContent = state.scoreVal;
    state.scoreText = scoreText;
    tieVideo.style.display = "none";

    healthText.textContent = state.healthVal;

    state.healthText = healthText;
    state.tieVideo = tieVideo;

    //applying space background to canvas
    //renderer.setClearColor(0xffffff);
    var texture = new THREE.TextureLoader().load("../images/space.jpg");
    scene.background = texture;

    initObjects(state);

    //call setup functions
    setupPlane(state);
    setupKeypresses(state);
    setupMouseMove(state);
    //load tiefighter model
    loadModel(state, '../models/tiefighter.obj', '../models/tiefighter.mtl', [0, 0, 10], true, '../models/', [1, 1, 1], null);
    //create collision box 
    state.collisionBox = createCube([0, 0, 10], false, false, false, [10, 10, 10], 0x000000);
    state.scene.add(state.collisionBox);

    state.camera.lookAt(new THREE.Vector3(0, 0, 0));

    function animate() {

        //Check if the ship has been loaded or not
        if (state.ship && state.finishedLoad && state.introDone && state.gameStarted) {

            //move the ship, plane, camera and light forward 
            if (state.moving) {
                state.ship.position.z += state.flySpeed;
                state.camera.position.z += state.flySpeed;
                state.plane.position.z += state.flySpeed;

                for (let i = 0; i < state.lights.length; i++) {
                    state.lights[i].position.z += state.flySpeed;
                }

                state.collisionBox.position.z += state.flySpeed;
            }

            //this logic was being used to bring the ship back to a neutral rotation
            if (state.ship.rotation.z > 0) {
                state.ship.rotation.z -= 0.0008;
            }
            else if (state.ship.rotation.z < 0) {
                state.ship.rotation.z += 0.0008;
            }

            if (state.ship.rotation.x > 0) {
                state.ship.rotation.x -= 0.0008;
            }
            else if (state.ship.rotation.x < 0) {
                state.ship.rotation.x += 0.0008;
            }

            if (state.collidableObjects.length > 0) {
                //console.log("detecting....");
                for (var vertexIndex = 0; vertexIndex < state.collisionBox.geometry.vertices.length; vertexIndex++) {
                    var localVertex = state.collisionBox.geometry.vertices[vertexIndex].clone();
                    var globalVertex = state.collisionBox.matrix.multiplyVector3(localVertex);
                    var directionVector = globalVertex.sub(state.collisionBox.position);

                    var ray = new THREE.Raycaster(state.collisionBox.position, directionVector.clone().normalize());
                    var collisionResults = ray.intersectObjects(state.collidableObjects);
                    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                        //console.log(collisionResults);
                        //for (let i = 0; i < state.collidableObjects.length; i++) {
                        //checkCollision(state, state.collidableObjects[i], collisionResults);
                        //}
                        checkCollision(state, collisionResults[0].object);

                    }
                    else {
                        state.moving = true;
                    }
                }
            }

            //update the ship location
            updateShipPosition(state);
            collidableDistanceCheck(state, 30);
            updateLine(state);
            rotatePowerUps(state, 0.01);
            updateTextValues(state);
            checkIfDead(state);
            moveAsteroids(state);
            //addMovingModels(state);

            if (state.invincible) {
                checkInvincibleTimer(state);
            }


        }
        //check if intro has been played or not
        if (introVideo.currentTime === introVideo.duration && !state.musicStarted) {
            introVideo.style.display = "none";
            skipButton.style.display = "none";
            state.introDone = true;
            startButton.style.display = "inline";
            playSound(state, 'sounds/starwarsSong.mp3', audioLoader, 0.25, true, false)
            state.musicStarted = true;



        }


        requestAnimationFrame(animate);
        renderer.render(scene, camera);

    }
    animate();
}

function createLight(state, scene, shadow, positionX, positionY, positionZ) {
    var light = new THREE.PointLight(0xffffff, 1, 100);
    light.shadow.mapSize.width = 512;  // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;       // default
    light.shadow.camera.far = 500      // default
    light.castShadow = shadow;
    light.position.set(positionX, positionY, positionZ);
    scene.add(light);
    state.lights.push(light);
}

/**
 * 
 * @param {Object from the json file} object 
 * @purpose Takes in an object from the json file and translates the object left and right within the canal
 */
function movableRock(cube) {
    console.log("****************************************");
    console.log(cube.position);
    var clock = new THREE.Clock();
    var delta = 0;
    var speed = 2;
    var goingLeft = true;

    function animate() {
        //onsole.log("movingggggg");
        delta = clock.getDelta();

        if (cube.position.x < 25.0 && goingLeft === true) {
            cube.translateX(speed * delta);

            if (cube.position.x === 25.0) {
                goingLeft = false;
            }
        }
        else if (cube.position.x > -30.0 && goingLeft === false) {
            cube.translateX(-speed * delta);

            if (cube.position.x === -25.0) {
                goingLeft = true;
            }
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    // Moving the object left and right
}

/**
 * 
 * @param {State variable holding game information} state 
 * @purpose Creates objects for the game and places them in the scene
 */
function initObjects(state) {
    loadJSON('../gameData/level.json',
        function (data) {
            //console.log(data);
            createObjs(data, state);
        },
        function (xhr) { console.error(xhr); }
    );
}

function createObjs(data, state) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].type === "cube") {
            // This will handle the creation of the canal walls to go as long as the level is
            if (data[i].ID === "rightStraightWall-0") {

                let pastPosition = data[i].position[2];
                for (var j = 0; j < 30; j++) {
                    let currentPosition = pastPosition + 100;
                    let cube = createCubeWithTexture([data[i].position[0], data[i].position[1], currentPosition], true, true, true, [data[i].geometry.width, data[i].geometry.height, data[i].geometry.depth], data[i].material.texture);
                    state.scene.add(cube);

                    pastPosition = currentPosition;
                }
            }
            else if (data[i].ID === "leftStraightWall-0") {

                let pastPosition = data[i].position[2];
                for (var j = 0; j < 30; j++) {
                    let currentPosition = pastPosition + 100;
                    let cube = createCubeWithTexture([data[i].position[0], data[i].position[1], currentPosition], true, true, true, [data[i].geometry.width, data[i].geometry.height, data[i].geometry.depth], data[i].material.texture);
                    state.scene.add(cube);

                    pastPosition = currentPosition;
                }
            }
            else if (data[i].ID === "finish") {
                let cube = createCube(data[i].position, true, true, true, [data[i].geometry.width, data[i].geometry.height, data[i].geometry.depth], data[i].material.diffuse, data[i].material.transparent, data[i].material.opacity);
                cube.type = data[i].ID;
                state.objects.push(cube);
                state.scene.add(cube);
            }

            // If the cube has a diffuse and no texture
            if (data[i].material.diffuse != null) {
                let cube = createCube(data[i].position, true, true, true, [data[i].geometry.width, data[i].geometry.height, data[i].geometry.depth], data[i].material.diffuse, data[i].material.transparent, data[i].material.opacity);
                if (data[i].collidable === true) {
                    cube.type = "wall";
                    state.objects.push(cube);
                }

                if (data[i].moving === true) {
                    movableRock(cube);
                }

                state.scene.add(cube);
            }
            // If the cube has a texture and no diffuse
            else {
                let cube = createCubeWithTexture(data[i].position, true, true, true, [data[i].geometry.width, data[i].geometry.height, data[i].geometry.depth], data[i].material.texture);
                if (data[i].collidable === true) {
                    cube.type = "wall";
                    state.objects.push(cube);
                }

                if (data[i].moving === true) {
                    movableRock(cube);
                }

                state.scene.add(cube);
            }
        }
        else if (data[i].type === "asteroid") {
            let cube = createCube(data[i].position, true, true, true, data[i].scale, 0x000000, true, 0.0);
            cube.type = "wall";

            state.objects.push(cube);
            state.scene.add(cube);

            if (data[i].moving) {
                state.movingAsteroids.push(cube);
                //console.log(data[i]);
                loadModel(state, '../models/RockPackByPava.obj', '../models/RockPackByPava.mtl', data[i].position, false, '../models/', data[i].scale, [0.37, 0.30, 0.26], true);
            }
            else {
                loadModel(state, '../models/RockPackByPava.obj', '../models/RockPackByPava.mtl', data[i].position, false, '../models/', data[i].scale, [0.37, 0.30, 0.26]);
            }
            // Assign a cube to the model for collision detection


        }
        else if (data[i].type === "powerup") {
            let cone = createPyramid(data[i].position, true, true, [data[i].geometry.radius, data[i].geometry.height, data[i].geometry.radialSegments], true, data[i].color, false, 0.5);
            cone.effect = data[i].effect;
            state.objects.push(cone);
            state.powerUpObjects.push(cone);
            state.scene.add(cone);
        }
    }
    state.finishedLoad = true;
}

main();