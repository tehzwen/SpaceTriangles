function main() {

    console.warn = function () { }; // now warnings do nothing!
    //state object for holding important values
    var state = {
        objects: [],
        lights: [],
        ship: null,
        collidableObjects: [],
        selectedIndex: 0,
        camera: null,
        scene: null,
        flySpeed: 0.3,
        mouseX: 0,
        mouseY: 0,
        moving: false,
        finishedLoad: false,
        canal: {
            x0: 40,
            x1: -40
        }

    }

    //create scene and camera
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = -5;
    camera.position.y = 1;
    state.scene = scene;
    state.camera = camera;

    //create white pointlight
    createLight(state, scene, false, 0, 100, 5);
    createLight(state, scene, true, 0, 50, 5);
    createLight(state, scene, false, -70, 100, 5);

    var AmbientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(AmbientLight);

    //create renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);

    //applying space background to canvas
    //renderer.setClearColor(0xffffff);
    var texture = new THREE.TextureLoader().load("../images/space.jpg");
    scene.background = texture;

    initObjects(state);

    //call setup functions
    setupPlane(state);
    setupKeypresses(state);
    setupMouseMove(state);

    state.camera.lookAt(new THREE.Vector3(0, 0, 0));

    function animate() {

        //Check if the ship has been loaded or not
        if (state.ship && state.finishedLoad) {

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
                console.log("detecting....");
                for (var vertexIndex = 0; vertexIndex < state.collisionBox.geometry.vertices.length; vertexIndex++) {
                    var localVertex = state.collisionBox.geometry.vertices[vertexIndex].clone();
                    var globalVertex = state.collisionBox.matrix.multiplyVector3(localVertex);
                    var directionVector = globalVertex.sub(state.collisionBox.position);

                    var ray = new THREE.Raycaster(state.collisionBox.position, directionVector.clone().normalize());
                    var collisionResults = ray.intersectObjects(state.collidableObjects);
                    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {

                        for (let i = 0; i < state.collidableObjects.length; i++) {
                            checkCollision(state, state.collidableObjects[i], collisionResults);
                        }

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
 * @param {State variable holding game information} state 
 * @purpose Creates objects for the game and places them in the scene
 */
function initObjects(state) {

    //load tiefighter model
    loadModel(state, '../models/tiefighter.obj', '../models/tiefighter.mtl', [0, 0, 10], true, '../models/');

    drawLine(state);

    loadJSON('../gameData/level.json',
        function (data) {
            //console.log(data);
            createObjs(data, state);
        },
        function (xhr) { console.error(xhr); }
    );

    //creating simple green box here
    //let cube = createCube([5, 15, 100], true, true, true, [10, 10, 10], 0x00FF00);
    let cube = createCubeWithTexture([5, 15, 100], true, true, true, [10, 10, 10], '../images/poggers.png', "repeat", "repeat", (4, 4));
    cube.type = "wall"
    state.objects.push(cube);
    state.scene.add(cube);

    //create collision box 
    state.collisionBox = createCube([0, 0, 10], false, false, false, [10, 10, 10], 0x000000);
    state.scene.add(state.collisionBox);

}

function createObjs(data, state) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].type === "cube") {

            // If the cube has a diffuse and no texture
            if (data[i].material.diffuse != null) {
                let cube = createCube(data[i].position, true, true, true, [data[i].geometry.width, data[i].geometry.height, data[i].geometry.depth], data[i].material.diffuse);
                if (data[i].collidable === true) {
                    cube.type = "wall";
                    state.objects.push(cube);
                }


                state.scene.add(cube);
                //console.log(cube);
            }
            // If the cube has a texture and no diffuse
            else {
                let cube = createCubeWithTexture(data[i].position, true, true, true, [data[i].geometry.width, data[i].geometry.height, data[i].geometry.depth], data[i].material.texture);
                if (data[i].collidable === true) {
                    cube.type = "wall";
                    state.objects.push(cube);
                }

                state.scene.add(cube);
            }
        }
    }
    state.finishedLoad = true;
}

main();