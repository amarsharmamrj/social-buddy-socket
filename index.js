import { Server } from "socket.io";
import dotenv from 'dotenv'

dotenv.config();

// const socket =  require('socket.io')
const port = process.env.PORT || 7000
const io = new Server(port, {
    cors: process.env.CLIENT_URL,
});

let users = []

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({userId, socketId})
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find((user) => user.userId === userId)
}

io.on("connection", (socket) => {
    console.log("a user connected") 
    io.emit("welcome", "hello welcome to social buddy char application")
    
    // on connect
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id)
        io.emit("getUsers", users)
    })

    // send and get message
    socket.on("sendMessageDeleted", ({senderId, receiverId, messageId}) => {
        const user = getUser(receiverId)
        if(user){
            io.to(user.socketId).emit("getMessageDeleted", {
                senderId, messageId
            })
        }
    })

    // send and get message deleted
    socket.on("sendMessage", ({senderId, receiverId, text, image}) => {
        const user = getUser(receiverId)
        if(user){
            io.to(user.socketId).emit("getMessage", {
                senderId, text, image
            })
        }
    })

    // router connect
    socket.on("routerConnect", ({data}) => {
        console.log("routerConnect:", data)
        // const user = getUser(receiverId)
        // if(user){
        //     io.to(user.socketId).emit("getMessage", {
        //         senderId, text, image
        //     })
        // }
    })

    // typing
    socket.on("typing", ({receiverId, typing, conversationId}) => {
        const user = getUser(receiverId)
        if(user){
            io.to(user.socketId).emit("typing", {
                typing, receiverId, conversationId
            })
        }
    })
    
    // on disconnect
    socket.on("disconnect", ()=> {
        console.log("a user connected") 
        removeUser(socket.id)  
        io.emit("getUsers", users)
    })


    // hi
    socket.on("hi", ({username}) => {
        socket.broadcast.emit("hey", username)
    })
})