const dotenv = require("dotenv").config();
const express = require("express"); //Instantiate express
const server = express();   //Create server variable
server.use(express.json());    //Use json for handling files
const PORT = process.env.PORT;

//MongoDB
const mongoose = require("mongoose");
const { route } = require("./Routes");
const db_URL = process.env.DB_URL;

//Connect to mongoDB
mongoose.connect(db_URL).then(()=>
console.log("Database connected successfully")
);


server.get("/home", (req, res)=>
{
    res.status(200).json({Message: "Welcome to the e-Learning Platform"});
});


//Start the server
server.listen(PORT, ()=>
{
    console.log("Server started at " + PORT + "...");
});

server.use("/api", route);