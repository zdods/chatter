const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var client_user = Array();
var currentUsers = Array();

app.use(express.static(__dirname + '/'));
// handle webpage request
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
// testing port
var port = process.env.PORT || 3000;
http.listen(3000, () => {
    console.log(`listening on port ${port}...`);
});

// on client connect
io.on('connection', function (socket) {
    // when client disconnects
    socket.on('disconnect', function () {
        // rmemove from arrays storing client IDs and names in use
        var index = currentUsers.indexOf(client_user[socket.client.id]);
        if (index !== -1) {
            currentUsers.splice(index, 1);
        }
        delete client_user[socket.client.id];
    });
    // when message sent, emit to all clients
    socket.on('chat message', function (msgData) {
        io.emit('chat message', msgData);
    });
    // when user registered
    socket.on('register user', function (user) {
        // push data to arrays for storage
        client_user[socket.client.id] = user;
        currentUsers.push(user);
    });
    // when request to check for existing users received
    socket.on('check users', function (checkData) {
        // if username in use
        if (currentUsers.indexOf(checkData.user) > -1) {
            // return true
            io.to(checkData.sid).emit('check users', true);
        } else {
            // return false
            io.to(checkData.sid).emit('check users', false);
        }
    });
});