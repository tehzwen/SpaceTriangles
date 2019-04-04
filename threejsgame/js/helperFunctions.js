var MAX_POINTS = 500;

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
 * @param {Boolean - determines if the object is transparent} transparent
 * @param {float - determines the value for object's opacity} opacity 
 * @return cube - cube object
 * @purpose creates a cube and returns it
 */
function createCube(position, castShadow, receiveShadow, visible, geometryVals, color, transparent, opacity) {

    if (typeof (color) === 'string') {
        color = parseInt(color, 16);
    }

    var geometry = new THREE.BoxGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    var material = new THREE.MeshPhongMaterial({ color: color, transparent: transparent, opacity: opacity });
    var cube = new THREE.Mesh(geometry, material);
    cube.position.x = position[0];
    cube.position.y = position[1];
    cube.position.z = position[2];
    cube.castShadow = castShadow;
    cube.receiveShadow = receiveShadow;
    cube.visible = visible;

    return cube;
}

function createCubeWithTexture(position, castShadow, receiveShadow, visible, geometryVals, textureURL, wrapS, wrapT, repeatTuple) {
    let texture = new THREE.TextureLoader().load(textureURL);
    let geometry = new THREE.BoxGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    //texture.repeat.set(repeatTuple[0], repeatTuple[1]);
    let material = new THREE.MeshBasicMaterial({
        map: texture
    });

    let cube = new THREE.Mesh(geometry, material);
    cube.position.x = position[0];
    cube.position.y = position[1];
    cube.position.z = position[2];
    cube.castShadow = castShadow;
    cube.receiveShadow = receiveShadow;
    cube.visible = visible;

    return cube;
}

function createPyramid(position, castShadow, receiveShadow, geometryVals, visible, color, transparent, opacity) {

    color = parseInt(color, 16);
    let geometry = new THREE.ConeGeometry(geometryVals[0], geometryVals[1], geometryVals[2]);
    let material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: transparent,
        opacity: opacity
    });
    let cone = new THREE.Mesh(geometry, material);

    cone.position.x = position[0];
    cone.position.y = position[1];
    cone.position.z = position[2];
    cone.castShadow = castShadow;
    cone.receiveShadow = receiveShadow;
    cone.visible = visible;
    cone.type = "powerup";

    return cone;
}


/**
 * 
 * @param {State variable holding all game info} state 
 * @param {Which direction we intend to move the ship} direction 
 * @purpose ####### WIP ####### rotates the ship
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
    let speed = 0.0009;

    //console.log(state.audioLoader);
    //console.log(state.audioLoader.isPlaying);
    if (state.healthVal > 0) {

        if (state.mouseX > 700 || state.mouseX < -700) {

            if (state.flySounds.length <= 0) {

                var rand = state.flySoundsPaths[Math.floor(Math.random() * state.flySoundsPaths.length)];

                let sound = playSound(state, rand, state.audioLoader, 0.15, false)
                state.flySounds.push(sound);
            }
            else {
                if (state.flySounds[0].isPlaying) {
                    console.log("here");
                }
                else {
                    state.flySounds.pop();
                }
            }
        }

        //move left
        if (state.mouseX > 0 && ship.position.x < state.canal.x0) {
            //console.log("MOVING MOUSE");
            ship.position.x += mouseX * speed;
            camera.position.x += mouseX * speed;
            state.mouseX += mouseX * speed;
            state.plane.position.x += mouseX * speed;
            state.collisionBox.position.x += mouseX * speed;
        }
        //move right
        else if (state.mouseX < 0 && ship.position.x > state.canal.x1) {
            //console.log(Math.abs(mouseX) * speed);
            ship.position.x -= Math.abs(mouseX) * speed;
            camera.position.x -= Math.abs(mouseX) * speed;
            state.mousex -= Math.abs(mouseX) * speed;
            state.plane.position.x -= Math.abs(mouseX) * speed;
            state.collisionBox.position.x -= Math.abs(mouseX) * speed;
        }
        //move up
        if (mouseY > 0 && ship.position.y < state.canal.y0) {

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



}


/**
 * 
 * @param {State variable holding all game information} state 
 * @purpose Listens for mouse movement and calculates mouse offset from center
 */
function setupMouseMove(state) {
    document.addEventListener("mousemove", (event) => {


        if (state.ship) {
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
 * @param {array for scaling of object} scale
 * @param {boolean for if the object is collidable}
 * @purpose Loads an obj file and applies it's material to it
 */
function loadModel(state, objURL, mtlURL, initialPosition, isPlayer, basePath, scale, color) {

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath(basePath);
    var url = mtlURL;

    mtlLoader.load(url, function (materials) {
        //console.log(materials);
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(basePath);
        objLoader.load(objURL, function (object) {
            object.position.set(initialPosition[0], initialPosition[1], initialPosition[2])

            object.traverse(function (child) {
                child.castShadow = true;
                child.receiveShadow = true;
            });

            if (materials.materials.None != null && color) {
                //console.log(materials.materials.None.color);
                materials.materials.None.color.r = color[0];
                materials.materials.None.color.g = color[1];
                materials.materials.None.color.b = color[2];
            }


            if (isPlayer) {
                object.scale.set(scale[0], scale[1], scale[2]);
                state.ship = object;
                state.scene.add(object);


            }
            else {
                object.scale.set(scale[0], scale[1], scale[2]);
                state.models.push(object);
                state.scene.add(object);
            }

        });

    });
}

function loadModelNoMaterial(state, objURL, initialPosition, isPlayer) {
    let material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: new THREE.Color(0xff0000),

    });
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(material);
    objLoader.setPath('../models/');
    objLoader.load(objURL, function (object) {
        object.position.set(initialPosition[0], initialPosition[1], initialPosition[2])

        object.traverse(function (child) {
            child.castShadow = true;
            child.receiveShadow = true;
        });

        if (isPlayer) {
            state.ship = object;
            state.scene.add(object);
        }
        else {
            state.objects.push(object);
            state.scene.add(object);
        }

    });
}

/**
 * 
 * @param {State variable holding all game info} state
 * @purpose Keyboard controls, not currently being used 
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
 * @param {holds game info} state 
 * @param {length of tube} lengthVal 
 * @param {color for the tube} color 
 * @param {array containing the points} pointsArray 
 * @param {tubular segment value} tubularSeg 
 * @param {radius for tube} radius 
 * @param {number of segments in radial direction} radialSeg 
 * @param {boolean to determine if tube is closed} closed 
 */
function createTube(state, lengthVal, color, pointsArray, tubularSeg, radius, radialSeg, closed) {

    //example for loop for declaring points along z axis
    /*
    for (let i = 0; i < lengthVal; i += 1) {
        state.tube.tubePoints.push(new THREE.Vector3(0, 15, 2.5 * (i / 4)));
    }*/

    let pathBase = new THREE.CatmullRomCurve3(pointsArray);
    state.tube.curve = pathBase;

    let tubeGeo = new THREE.TubeBufferGeometry(pathBase, tubularSeg, radius, radialSeg, closed);
    tubeGeo.needsUpdate = true;
    state.tube.tubeGeo = tubeGeo;

    let tubeMat = new THREE.MeshPhongMaterial({
        side: THREE.BackSide,
        color: color
    });

    state.tube.mat = tubeMat;

    let mesh = new THREE.Mesh(tubeGeo, tubeMat);
    //mesh.position.z = 30;   
    state.tube.object = mesh;
    state.objects.push(mesh);
    state.scene.add(mesh);
}


/**
 * 
 * @param {State variable holding all the game info} state 
 * @purpose Creates the base plane for the game and stores it in state.plane
 */
function setupPlane(state) {
    let side = 120;
    geometry = new THREE.PlaneGeometry(side * 5, side * 10);
    let material = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: new THREE.Color(0x777777),
        side: THREE.FrontSide
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

function checkCollision(state, collision, collisionResults) {

    //console.log(collision);

    if (collision.type === "wall") {
        state.moving = false;
        //console.log("hit a wall!")
        if (state.healthVal > 0) {
            state.healthVal -= 0.25;
        }

    }
    else if (collision.type === "powerup" && !state.collisionMade) {
        state.collisionMade = true;
        if (collision.effect === "points") {
            //increment score text
            //play r2 beep
            playSound(state, '../sounds/R2D2Beep.mp3', state.audioLoader, 0.25, false, false);
        }
        else if (collision.effect === "health") {
            if (state.healthVal < 100) {
                if (state.healthVal + 5 > 100) {
                    state.healthVal = 100;
                }
                else {
                    state.healthVal += 0.5;
                }

            }

            //add some points too :)
            //play R2 Health
            playSound(state, '../sounds/R2D2Health.wav', state.audioLoader, 0.25, false, false);
        }
        else if (collision.effect === "invincible") {
            //play scream lmao
            //make collider off or something!?!? for like 5 seconds
            //maybe chang eship opacity bitches
            playSound(state, '../sounds/R2D2Scream.wav', state.audioLoader, 0.25, false, false);
        }



        collision.geometry.dispose();
        collision.material.dispose();
        state.scene.remove(collision);
        state.collisionMade = false;


    }
    else {
        state.moving = true;
        
    }



}

function drawLine(state) {

    var material = new THREE.LineBasicMaterial({
        color: 0x00ff00
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-10, 0, 10),
        new THREE.Vector3(0, 10, 10)
    );

    var line = new THREE.Line(geometry, material);
    state.line = line;
    state.scene.add(line);
}

function updateLine(state) {
    //console.log(state.line.geometry.vertices);
    //console.log(state.line.geometry.vertices[0]);
    //console.log(state.line.geometry.vertices);
    //state.line.geometry.vertices[0].x += 0.5;
    //state.line.geometry.verticesNeedUpdate = true;

}


/**
 * 
 * @param {path of json file to be loaded} path 
 * @param {call back function upon success} success 
 * @param {call back function upon failure} error 
 */
function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function playSound(state, path, audioLoader, volume, loop, flySound) {

    let sound = new THREE.Audio(state.listener);

    audioLoader.load(path, function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(loop);
        sound.setVolume(volume);
        sound.play();
    });

    return sound;
}

function checkIfSoundsPlaying(state) {
    for (let i = 0; i < state.flySounds.length; i++) {

        console.log(state.flySounds[0].isPlaying);
        if (state.flySounds[i].isPlaying) {
            state.flySoundPlaying = true;
        }
        else {
            state.flySounds.pop();
        }
    }
}

function rotatePowerUps(state, rotateSpeed) {
    for (let i = 0; i < state.powerUpObjects.length; i++) {
        state.powerUpObjects[i].rotateY(rotateSpeed);
        state.powerUpObjects[i].rotateZ(rotateSpeed);
    }
}


function updateHealth(state) {
    state.healthText.textContent = state.healthVal;
}

function checkIfDead(state) {
    if (state.healthVal <= 0) {
        state.moving = false;
        state.tieVideo.style.display = "inline";
        state.tieVideo.style.width = "100%";
        state.tieVideo.style.height = "100%";
        state.tieVideo.style.position = "absolute";
        //state.tieVideo.muted = false;

        if (!state.videoDonePlaying) {
            state.tieVideo.play();
            state.videoDonePlaying = true;
        }

        //if (state.tieVideo)
        //console.log(state.tieVideo.currentTime + " vs " + state.tieVideo.duration);

        if (state.tieVideo.currentTime === state.tieVideo.duration) {
            state.tieVideo.style.display = "none";
            resetGame(state);
        }
    }
}

function resetGame(state) {
    //iterate through existing game objects and delete them
    for (let i = 0; i < state.objects.length; i++) {

        state.objects[i].material.dispose();
        state.objects[i].geometry.dispose();
        state.scene.remove(state.objects[i]);
        //state.objects.pop(state.objects[i]);


    }
    state.objects = [];

    for (let i = 0; i < state.models.length; i++) {
        state.scene.remove(state.models[i]);
    }
    state.camera.position.set(0, 1, -5);
    state.collisionBox.position.set(0, 0, 10)
    state.ship.position.set(0, 0, 10);

    initObjects(state);

    for (let i = 0; i < state.lights.length; i++) {

        state.scene.remove(state.lights[i]);
    }

    createLight(state, state.scene, false, 0, 100, 5);
    createLight(state, state.scene, true, 0, 50, 5);
    createLight(state, state.scene, false, 0, 50, 70);
    createLight(state, state.scene, false, -70, 100, 5);
    state.videoDonePlaying = false;
    state.healthVal = 100;

    state.plane.position.x = 0;
    state.plane.position.y = -5;
    state.plane.position.z = 0;

    console.log(state.objects);
}