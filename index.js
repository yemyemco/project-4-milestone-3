const dotenv = require("dotenv").config();
const express = require("express"); //Instantiate express
const server = express();   //Create server variable
server.use(express.json());    //Use json for handling files
const PORT = process.env.PORT||5000;

//MongoDB
const mongoose = require("mongoose");
const db_URL = process.env.DB_URL;

//Connect to mongoDB
mongoose.connect(db_URL).then(()=>
console.log("Database connected successfully")
);

//Bring in the routes
const authRoutes = require("./Routes/auth");

server.get("/home", (req, res)=>
{
    res.status(200).json({Message: "Welcome to the e-Learning Platform"});
});


//Start the server
server.listen(PORT, ()=>
{
    console.log("Server started at " + PORT + "...");
});

server.use("/", authRoutes);
