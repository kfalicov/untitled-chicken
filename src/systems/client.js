/** server stuff */
var io = require("socket.io-client");
// var socket = io.connect("72.83.103.174:4196");
var socket = io.connect("192.168.1.156:4196");

socket.on("connect", function () {
    console.log('socket io client enabled')
});

module.exports = {
    socket
}