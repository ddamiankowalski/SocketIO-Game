const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;

let playerList = [];
let activeClients = [];
let idToDelete;

class Player {
    constructor(id) {
        this.playerId = id;
        this.xPos = Math.floor(Math.random() * 100);
        this.yPos = Math.floor(Math.random() * 100);
    }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/www/index.html')
});

io.on('connection', (socket) => {
    console.log('new connection!')

    socket.on('changePos', (id, left, top) => {
        playerList.forEach((player) => {
            if(id == player.playerId) {
                player.xPos = left;
                player.yPos = top;
            }
        }) 
        io.volatile.emit('refreshData', playerList);
    })

    // adding a new client to activeClients array
    activeClients.push(socket);

    // adding a new player to a playerList
    let player = new Player(socket.id);
    playerList.push(player);
    
    io.to(socket.id).emit('renderAllOther', playerList, socket.id);

    io.emit('addPlayersData', playerList, player, socket.id);

    socket.on('disconnect', function() {
        console.log('disconnected!')
        
        // deleting a disconnected client from activeClients array
        let i = activeClients.indexOf(socket);
        idToDelete = activeClients[i].id;
        console.log(idToDelete)
        activeClients.splice(i, 1);
        
        // making changes in playerList
        playerList = playerList.filter(playerDisconnectDelete);
        console.log(playerList);

        // emitting information about the changes
        io.emit('deletePlayersData', playerList, socket.id);
    })
})

// game loop situated on the server or backend
// setInterval(() => {
//     // playerList.forEach(function(element) {
//     //     element.xPos = element.xPos + 1;
//     //     element.yPos = element.yPos + 1;
//     // })
    
// }, 50)



server.listen(port, () => {
    console.log('listening on *:3000')
})

function playerDisconnectDelete(value) {
    return value.playerId != idToDelete;
}