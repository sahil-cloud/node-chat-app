const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require('./utils/message');
const {userJoin , getCurrentUser, userLeave , getRoomUsers} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const name = "iTalk";

// set static path for html and css files
app.use(express.static(path.join(__dirname,"public")));

// for every new connection adding event handler in socket io
io.on("connection", socket =>{
    // for debug
    console.log("new connection..");

    socket.on("joinRoom",({username , room}) =>{
        const user = userJoin(socket.id,username,room);

        socket.join(user.room);
        
        // message only for the joining user
        socket.emit("message",formatMessage(name,"Welcome to iTalk :Talk to anyone")); 
    
        // brodcast when a new user connects this will emit to everyone except user connecting
        socket.broadcast.to(user.room).emit("message",formatMessage(name,`${user.username} has joined the chat`));

        // getting users in sidebar
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });


    
    // listen for chat message
    socket.on("chatMessage",(msg) =>{
        const user = getCurrentUser(socket.id);

        // console.log(msg);
        io.to(user.room).emit("message",formatMessage(user.username,msg));


        // when someone dissconnects
        socket.on("disconnect",() =>{
            // getting the remove usser
            const user = userLeave(socket.id);

            if(user){
            // emits to everone
            io.to(user.room).emit("message",formatMessage(name,`${user.username} has left the chat`));

                // getting users in sidebar
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });

            }
            
        });
        
    });
})

PORT = 80 || process.env.PORT ;

server.listen(PORT,()=>{
    console.log(`server running at ${PORT}`);
});