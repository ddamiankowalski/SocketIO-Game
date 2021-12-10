    var socket = io();

    let localPlayerInfo, localPlayerId, localPlayerName, isGameStarted = false, localPlayerVelocity = [0, 0], localPlayerAcceleration = [0,0];
    let keyD = false, keyW = false, keyA = false, keyS = false;

    var form = document.getElementById('form');
    var input = document.getElementById('input');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (input.value) {
        localPlayerName = input.value;
        console.log(input.value)
        socket.emit('startGame', localPlayerName);
        isGameStarted = true;
        document.getElementById('usernameWrapper').remove();
        input.value = '';
        }
    });

    socket.on('addPlayersData', (res, playerInfo, id) => {
        // this handler emits information to all clients about the newly added Player

        localPlayerInfo = res;

        // rendering the new element on screen for already existing clients
        let newSquare = document.createElement('div');
        newSquare.id = `${id}`;
        newSquare.style.top = `${playerInfo.yPos}px`;
        newSquare.style.left = `${playerInfo.xPos}px`;
        newSquare.className = 'square';
        let name = document.createElement('p');
        name.innerText = playerInfo.name;

        newSquare.appendChild(name);
        document.body.appendChild(newSquare);
    })

    socket.on('deletePlayersData', (res, id) => {
        localPlayerInfo = res;

        // delete element from html DOM
        let allSquares = document.getElementsByClassName('square');
        for(let square of allSquares) {
            if(id == square.id) {
                square.remove();
            }
        }
    })

    socket.on('refreshData', (res) => {
        // refreshing the data each 1ms using the udp-like protocol (see volatile in socket.io for reference)

        localPlayerInfo = res;
        localPlayerInfo.forEach(square => {
            if(square.playerId != localPlayerId) {
                let elementToChange = document.getElementById(`${square.playerId}`);
                if(elementToChange == null) return;
                elementToChange.style.top = square.yPos + 'px';
                elementToChange.style.left = square.xPos + 'px';
            }  
        })
    })

    socket.on('renderAllOther', (res, id) => {
        // render all the players
        localPlayerId = id;
        res.forEach(square => {
            if(id != square.playerId) {
                // rendering every existing element on screen for the newly connected client
                let newSquare = document.createElement('div');
                newSquare.id = `${square.playerId}`;
                newSquare.style.top = `${square.yPos}px`;
                newSquare.style.left = `${square.xPos}px`;
                newSquare.className = 'square';
                let name = document.createElement('p');
                name.innerText = square.name;

                newSquare.appendChild(name);
                document.body.appendChild(newSquare);
            }
        })
    })

    // listening for WSAD movement
    window.addEventListener('keydown', keyDownHandler, false);
    window.addEventListener('keyup', keyUpHandler, false);

    function keyDownHandler(ev) {
        let keyCode = ev.keyCode;
        switch (keyCode) {
            case 68:
                keyD = true;
                break;
            case 83: 
                keyS = true;
                break;
            case 65:
                keyA = true;
                break;
            case 87:
                keyW = true;
                break;
        }
    }

    function keyUpHandler(ev) {
        let keyCode = ev.keyCode;
        switch (keyCode) {
            case 68:
                keyD = false;
                break;
            case 83: 
                keyS = false;
                break;
            case 65:
                keyA = false;
                break;
            case 87:
                keyW = false;
                break;
        }
    }


    // PLAYER MOVEMENT SECTION

    let acceleration = 1;

    let dotProduct = (a, b) => a.map((x, i) => x + b[i]);

    window.setInterval(() => {
        if(!isGameStarted) return;
        if(keyD && keyS) {
            localPlayerAcceleration = [0.1, 0.1];
            localPlayerVelocity = dotProduct(localPlayerVelocity, localPlayerAcceleration)
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.left = elementToMove.getBoundingClientRect().left + localPlayerVelocity[0] + 'px';
            elementToMove.style.top = elementToMove.getBoundingClientRect().top + localPlayerVelocity[1] + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        }else if(keyD && keyW) {
            localPlayerAcceleration = [0.1, 0.1];
            localPlayerVelocity = dotProduct(localPlayerVelocity, localPlayerAcceleration)
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.left = elementToMove.getBoundingClientRect().left + localPlayerVelocity[0] + 'px';
            elementToMove.style.top = elementToMove.getBoundingClientRect().top - localPlayerVelocity[1] + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        }else if(keyA && keyW) {
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.left = elementToMove.getBoundingClientRect().left - 1 + 'px';
            elementToMove.style.top = elementToMove.getBoundingClientRect().top - 1 + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        }else if(keyA && keyS) {
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.left = elementToMove.getBoundingClientRect().left - 1 + 'px';
            elementToMove.style.top = elementToMove.getBoundingClientRect().top + 1 + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        }else if(keyD) {
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.left = elementToMove.getBoundingClientRect().left + 1 + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        }else if(keyA) {
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.left = elementToMove.getBoundingClientRect().left - 1 + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        } else if(keyS) {
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.top = elementToMove.getBoundingClientRect().top + 1 + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        } else if(keyW) {
            let elementToMove = document.getElementById(localPlayerId);
            elementToMove.style.top = elementToMove.getBoundingClientRect().top - 1 + 'px';
            
            // emit the information about the square's location back to the server
            socket.volatile.emit('changePos', localPlayerId, elementToMove.getBoundingClientRect().left, elementToMove.getBoundingClientRect().top);
        }else if(Math.abs(localPlayerVelocity[0]) > 0.1 || Math.abs(localPlayerVelocity[1]) > 0.1) {
            if(Math.abs(localPlayerVelocity[0]) > 0.1) {
                if(localPlayerVelocity[0] > 0.1) {
                    localPlayerAcceleration = [-0.1, 0];
                    localPlayerVelocity = dotProduct(localPlayerVelocity, localPlayerAcceleration)
                }else {
                    localPlayerAcceleration = [0.1, 0];
                    localPlayerVelocity = dotProduct(localPlayerVelocity, localPlayerAcceleration)
                }
                let elementToMove = document.getElementById(localPlayerId);
                elementToMove.style.left = elementToMove.getBoundingClientRect().left + localPlayerVelocity[0] + 'px';
                elementToMove.style.top = elementToMove.getBoundingClientRect().top + localPlayerVelocity[1] + 'px';
            }
            if(Math.abs(localPlayerVelocity[1]) > 0.1) {
                if(localPlayerVelocity[1] > 0.1) {
                    localPlayerAcceleration = [0, -0.1];
                    localPlayerVelocity = dotProduct(localPlayerVelocity, localPlayerAcceleration)
                }else {
                    localPlayerAcceleration = [0, 0.1];
                    localPlayerVelocity = dotProduct(localPlayerVelocity, localPlayerAcceleration)
                }
                let elementToMove = document.getElementById(localPlayerId);
                elementToMove.style.left = elementToMove.getBoundingClientRect().left + localPlayerVelocity[0] + 'px';
                elementToMove.style.top = elementToMove.getBoundingClientRect().top + localPlayerVelocity[1] + 'px';
            }
        }
    }, 10)