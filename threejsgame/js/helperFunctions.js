
/**
 * 
 * @param {State variable containing game information} state 
 * @param {Number - distance to check of objects} distanceThreshold 
 * @purpose Checks distances to add and remove objects from state.collidableObjects to cut down on cost for collision detection
 */
function collidableDistanceCheck(state, distanceThreshold) {
    //check the distance of each object in the objects array that isnt our ship and add to collidable array if close
    if (state.objects.length > 0) {
        for (let x = 0; x < state.objects.length; x++) {
            //console.log(state.ship.position.distanceTo(state.objects[x].position));
            if (state.ship.position.distanceTo(state.objects[x].position) <= distanceThreshold && state.objects[x] !== state.ship && !state.collidableObjects.includes(state.objects[x])) {
                state.collidableObjects.push(state.objects[x]);
            }
        }
    }

    //check if collidable objects have left collidable range
    if (state.collidableObjects.length > 0) {
        for (let i = 0; i < state.collidableObjects.length; i++) {
            if (state.ship.position.distanceTo(state.collidableObjects[i].position) >= distanceThreshold) {
                state.collidableObjects.splice(i);
            }
        }
    }
}


/**
 * 
 * @param {Array - Initial position of cube [x,y,z]} position 
 * @param {Boolean - determines if cube will cast a shadow} castShadow 
 * @param {Boolean - determines if cube will receive a shadow} receiveShadow 
 * @param {Boolean - determines if cube is visible} visible 
 * @param {Array - Geometry of cube [x,y,z]} geometryVals 
 * @param {Hex - value for color as hex value} color 
 * @return cube - cube object
 * @purpose creates a cube and returns it
 */
function createCube(position, castShadow, receiveShadow, visible, geometryVals, color) {
    var geometry = new THREE.BoxGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var cube = new THREE.Mesh(geometry, material);
    cube.position.x = position[0];
    cube.position.y = position[1];
    cube.position.z = position[2];
    cube.castShadow = castShadow;
    cube.receiveShadow = receiveShadow;
    cube.visible = visible;

    return cube;
}


/**
 * 
 * @param {State variable holding all game info} state 
 * @param {Which direction we intend to move the ship} direction 
 * @Purpose ####### WIP ####### rotates the ship
 */
function rotateShip(state, direction) {
    var ship = state.objects[state.selectedIndex];
    let turnRate = 0.005;

    if (direction === "Left") {
        ship.rotation.z -= turnRate;
    }
    else if (direction === "Right") {
        ship.rotation.z += turnRate;
    }

    else if (direction === "Up") {
        ship.rotation.x += turnRate;
    }

    else if (direction === "Down") {
        ship.rotation.x -= turnRate;
    }
}


/**
 * 
 * @param {state variable holding game info} state 
 * @purpose Updates the ships position every frame based off of where the mouse is
 */
function updateShipPosition(state) {
    var ship = state.ship;
    var camera = state.camera;
    var mouseX = state.mouseX;
    var mouseY = state.mouseY;
    let speed = 0.0002;

    //move left
    if (state.mouseX > 0) {
        ship.position.x += mouseX * speed;
        camera.position.x += mouseX * speed;
        state.mouseX += mouseX * speed;
        state.plane.position.x += mouseX * speed;
        state.collisionBox.position.x += mouseX * speed;
    }
    //move right
    else if (state.mouseX < 0) {
        //console.log(Math.abs(mouseX) * speed);
        ship.position.x -= Math.abs(mouseX) * speed;
        camera.position.x -= Math.abs(mouseX) * speed;
        state.mousex -= Math.abs(mouseX) * speed;
        state.plane.position.x -= Math.abs(mouseX) * speed;
        state.collisionBox.position.x -= Math.abs(mouseX) * speed;
    }
    //move up
    if (mouseY > 0) {

        ship.position.y += mouseY * speed;
        camera.position.y += mouseY * speed;
        state.mouseY += mouseY * speed;
        state.collisionBox.position.y += mouseY * speed;
    }
    //move down
    else if (mouseY < 0) {

        //check if above plane
        if (ship.position.y > -2) {
            ship.position.y -= Math.abs(mouseY) * speed;
            camera.position.y -= Math.abs(mouseY) * speed;
            state.mouseY -= Math.abs(mouseY) * speed;
            state.collisionBox.position.y -= Math.abs(mouseY) * speed;
        }

    }
}


/**
 * 
 * @param {State variable holding all game information} state 
 * @purpose Listens for mouse movement and calculates mouse offset from center
 */
function setupMouseMove(state) {
    document.addEventListener("mousemove", (event) => {

        if (state.objects[state.selectedIndex]) {
            /*Get offset of mouse from screen center */
            let movementX = window.innerWidth / 2 - event.clientX;
            let movementY = window.innerHeight / 2 - event.clientY;

            if (event.ctrlKey) {
                console.log("here");
                if (movementX > 0) {
                    state.camera.rotation.y -= 0.002;
                }
                else if (movementX < 0) {
                    state.camera.rotation.y += 0.002;
                }

                if (movementY > 0) {
                    state.camera.rotation.x -= 0.002;
                }

                else if (movementY < 0) {
                    state.camera.rotation.x += 0.002;
                }
            }
            else {
                if (movementX > 0) {
                    state.mouseX = movementX;
                    //rotateShip(state,"Left");
                }
                else if (movementX < 0) {
                    state.mouseX = movementX;
                    //rotateShip(state,"Right");
                }

                if (movementY > 0) {
                    state.mouseY = movementY;
                    //console.log(state.mouseY);
                    //rotateShip(state,"Down");
                }

                else if (movementY < 0) {
                    state.mouseY = movementY;
                    //console.log(state.mouseY);
                    //rotateShip(state,"Up");
                }
            }

        }

    });
}

/**
 * 
 * @param {state object containing game info} state 
 * @param {string url of the obj file} objURL 
 * @param {string url of the mtl file} mtlURL 
 * @param {array of coordinates for position(x,y,z)} initialPosition 
 * @Purpose Loads an obj file and applies it's material to it
 */
function loadModel(state, objURL, mtlURL, initialPosition, isPlayer) {
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('../models/');
    var url = mtlURL;
    mtlLoader.load(url, function (materials) {

        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('../models/');
        objLoader.load(objURL, function (object) {
            object.position.set(initialPosition[0], initialPosition[1], initialPosition[2])

            object.traverse(function (child) {
                child.castShadow = true;
                child.receiveShadow = true;
            });

            if (isPlayer){
                state.ship = object;
                state.scene.add(object);
            }
            else{
                state.objects.push(object);
                state.scene.add(object);
            }

        });

    });
}

/**
 * 
 * @param {State variable holding all game info} state
 * @Purpose Keyboard controls, not currently being used 
 */
function setupKeypresses(state) {
    document.addEventListener("keydown", (event) => {


        if (state.objects[state.selectedIndex]) {
            var ship = state.ship;
            var camera = state.camera;
            var moveVector;
            var camMoveVector;

            switch (event.code) {
                case "KeyA":
                    console.log("left");
                    moveVector = new THREE.Vector3(ship.position.x + 0.2, ship.position.y, ship.position.z);
                    camMoveVector = new THREE.Vector3(camera.position.x + 0.2, camera.position.y, camera.position.z);
                    ship.position.lerp(moveVector, 1);
                    camera.position.lerp(camMoveVector, 1);
                    rotateShip(state, "Left");

                    break;
                case "KeyD":
                    moveVector = new THREE.Vector3(ship.position.x - 0.2, ship.position.y, ship.position.z);
                    camMoveVector = new THREE.Vector3(camera.position.x - 0.2, camera.position.y, camera.position.z);
                    ship.position.lerp(moveVector, 1);
                    camera.position.lerp(camMoveVector, 1);
                    rotateShip(state, "Right");

                    break;
                case "KeyW":
                    console.log("down");
                    break;
                case "KeyS":
                    console.log("up");

                    break;

                case "KeyE":
                    camera.rotation.y += 0.5;
                    break;

                case "KeyQ":
                    camera.rotation.y -= 0.5;
                    break;

                case "KeyR":
                    camera.rotation.x -= 0.5;
                    break;

                case "KeyT":
                    camera.rotation.x -= 0.5;
                    break;

                case "Space":
                    state.plane.rotation.x += 0.2;

                    break;

                default:


                    break;
            }
        }


    });


}


/**
 * 
 * @param {State variable holding all the game info} state 
 * @purpose Creates the base plane for the game and stores it in state.plane
 */
function setupPlane(state) {
    let side = 120;
    geometry = new THREE.PlaneGeometry(side, side, side * 2, side * 2);
    let material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: new THREE.Color(0xff0000),
    });
    plane = new THREE.Mesh(geometry, material);
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.renderSingleSided = false;
    plane.position.x = 0;
    plane.position.y = -5;
    plane.position.z = 0;
    plane.rotation.x = 11;
    state.plane = plane;

    state.scene.add(plane);
}
