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
        flySpeed: 0.1,
        mouseX: 0,
        mouseY: 0
    }

    //create scene and camera
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = -5;
    camera.position.y = 1;
    state.scene = scene;
    state.camera = camera;


    //create white pointlight
    var light = new THREE.PointLight(0xffffff, 1, 100);
    light.shadow.mapSize.width = 512;  // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;       // default
    light.shadow.camera.far = 500      // default
    light.castShadow = true;
    light.position.set(0, 50, 5);
    scene.add(light);
    state.lights.push(light);

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
        if (state.ship) {
            //move the ship, plane, camera and light forward 
            state.ship.position.z += state.flySpeed;
            state.camera.position.z += state.flySpeed;
            state.plane.position.z += state.flySpeed;
            state.lights[0].position.z += state.flySpeed;
            state.collisionBox.position.z += state.flySpeed;

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
                        // a collision occurred... do something...
                        console.log("Collision!");
                    }
                }
            }

            //update the ship location
            updateShipPosition(state);

            collidableDistanceCheck(state, 30);

        }

        requestAnimationFrame(animate);
        renderer.render(scene, camera);


    }
    animate();


}


/**
 * 
 * @param {State variable holding game information} state 
 * @purpose Creates objects for the game and places them in the scene
 */
function initObjects(state) {

    //load tiefighter model
    loadModel(state, '../models/tiefighter.obj', '../models/tiefighter.mtl', [0, 0, 10], true);

    //creating simple green box here
    let cube = createCube([5, 15, 100], true, true, true, [10, 10, 10], 0x00FF00);
    state.objects.push(cube);
    state.scene.add(cube);

    //create collision box 
    state.collisionBox = createCube([0, 0, 10], false, false, false, [5, 5, 5], 0x000000);
    state.scene.add(state.collisionBox);

}


main();