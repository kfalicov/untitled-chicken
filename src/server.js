// const app = require('express')();
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);

const io = require('socket.io');
const server = io.listen(4196);

server.on("connection", client=>{
    client.on("join",function(room, oldroom, createPlayers){
        console.log("joining room "+room);
        server.in(room).clients((err, clients)=>{
            //this callback function takes in the players existing on the server already.
            createPlayers(clients);
        });
        client.leaveAll();
        client.join(room);
        //notify the rest of the room that a new player has joined
        server.to(room).emit("new player", client.id);
    });
    client.on("disconnecting", ()=>{
        var room = Object.keys(client.rooms)[0];
        server.to(room).emit("remove player", client.id);
    })
    client.on("player moved", (force)=>{
        var room = Object.keys(client.rooms)[0];
        server.to(room).emit("move player", client.id, force);
    })
})

module.exports = {
    server
}