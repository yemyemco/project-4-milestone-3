const jwt = require("jsonwebtoken");
const { get } = require("mongoose");
const dotenv = require("dotenv").config();
const userDB = require("../models/userDB");

//Verify user's token   
module.exports = 
{
    verifyToken: async function (req, res, next)
    {
        try {
        let getToken = req.headers["x-access-token"] || req.header("Authorisation") || req.body.token || req.query.token;
        
        getToken = getToken?.replace("Bearer ", "");
        
        if(!getToken)
        {
            return res.status(400).json({Message: "Token error: Log in again"});
        }
            
            //Verify token
            const decoded = jwt.verify(getToken, process.env.ACCESS_TOKEN);

            const user = await userDB.findOne({token: getToken});

            if(!user)
            {
                return res.status(404).json({Message: "User not found"});
            }

            req.user = user;
            req.token = getToken;

            return next();

        } catch (error) {
            if(error.message == "jwt expired")
            {
                return res.status(400).json({Message: "Session expired. Please log in again"});
            }
            else
            {
                return res.status(400).json({Message: "Encountered error: " + error.message});
            }
        }
    }       
}
