//Project Milestone 1
const dotenv = require("dotenv").config();
const express = require("express"); //Instantiate express
const server = express();   //Create server variable
server.use(express.json());    //Use json for handling files
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Models
const userdb = require("../models/userDB");
const coursedb = require("../models/courseDB");
const enrollDB = require("../models/enrollmentDB");

module.exports =
{
    //API for sign up
    signup: async function(req, res)
    {
        //Check whether user alread exists
        try
        {
            const {firstName, lastName, email, pass} = req.body;      //Get user's details
            //Ensure all fields have been filled
            if (!firstName || !lastName || !email || !pass) 
                {
                    return res.status(400).json({Message: "All fields are required"});
                }
            
            //Check whether user already exists
            const foundUser = await userdb.findOne({email: email});
            if(foundUser)
            {
                return res.status(403).json({Message: "Forbidden! The user ID provided already exists"});
            }
            
            //Encrypt (hash) password
            const encryptedpassword = await bcrypt.hash(pass, 12);

            //Create token for the new user
            const token = jwt.sign({
                email},
                process.env.ACCESS_TOKEN,
                {expiresIn: "1h"});

            const user = await new userdb({firstName, lastName, email: email.toLowerCase(), pass: encryptedpassword, token: token}); 
            await user.save();  //Save new user's details
                
                //Return the new user
                res.status(201).json(
                    {Message: "Success! " + user.firstName + ", your account has been created"});
        }
        catch(error)
        {
            console.log("Error encountered: ", error.message);
        }
    },

    //API for signing in
    signin: async function (req, res)
    {
        try
        {
            const {email, pass} = req.body;
            if(!email || !pass)
            {
                return res.status(400).json({Message: "All fields required"});
            }
            const user = await userdb.findOne({email: email});
            if(!user)
            {
                return res.status(404).json({Message: "User does not exist. Create an account"});
            }
            
            const foundUser = await userdb.findOne({email: email});
            if(foundUser)
            {
                const passwordMatch = await bcrypt.compare(pass, user?.pass);
                if(passwordMatch)
                    {
                        //Generate access and refresh tokens for user
                        const accessToken = jwt.sign(
                        {email: foundUser?.email}, 
                        process.env.ACCESS_TOKEN,
                        {expiresIn: "1h"});

                        const refreshToken = jwt.sign(
                        {email: foundUser?.email}, 
                        process.env.REFRESH_TOKEN,
                        {expiresIn: "2h"});

                        res.status(200).json({Message: "Success! Welcome " + foundUser.firstName,
                            AccessToken: accessToken
                        });
                    }
                    else
                    {
                        res.status(400).json({Message: "Action failed! Invalid username or password"});
                    }
            }
        }
        catch(error)
        {
            return res.status(400).json({Message: "Error encountered: " + error.message});
        }
    },

    //API for creating or adding courses
    createcourse: async function (req, res)
    {
        try {
            //Check input
            const {email, code, title, unit, semester} = req.body;
            
            if (!email || !code || !title || !unit || !semester)
            {
                return res.status(400).json({Message: "Error! All fields required"});
            }
            
            //Check user's role
            const user = await userdb.findOne({email: email});
            
            if(!user)
            {
                return res.status(400).json({Message: "Error: Wrong user"});
            }
            
            if (user.role != "instructor")
            {
                return res.status(400).json({Message: "Error: Unauthorised operation"});
            }

            //Check if course already exists
            const findCourse = await coursedb.findOne({code: code});
            if (findCourse)
            {
                return res.status(403).json({Message: "Forbidden! " + code + " already exists"});
            }

            //Save course to database
            const course = new coursedb({code, title, unit, semester});
            await course.save();
            res.status(201).json({Message: "Success! " + course.code + " has been created."});
        } catch (error) {
            return res.status(400).json({Message: "Oops! Something went wrong" + error.message});
        }
    },

    //Project Milestone 2
    //API for enrolling students
    enrollstudent: async function(req, res)
    {
        try {
            const {name: {firstName, middleName, lastName}, dob, email, entryMode} = req.body;

            //Verify input
            if(!firstName || !lastName || !dob || !email || !entryMode)
            {
                return res.status(400).json({Message: "All required fields must be filled"});
            }
            
            const isEmailExisting = await enrollDB.findOne({email: email});
            if(isEmailExisting)
            {
                return res.status(400).json({Message: "Error: Account already exists"});
            }
            //Generate matric number for student
            let isExisting = "";
            let matric_no = serial_no = 0;
            
            do {
                serial_no = (Math.random() * (9999 - 1000)+1000); //Get a random number betwee 1000 and 9999
                matric_no= new Date().getFullYear() + serial_no.toFixed(0);
                
                //Check whether matric number already exists
                isExisting = await enrollDB.findOne({matricNo: matric_no});
            } while(isExisting);

            //Assign level
            if(entryMode == "UTME")
                {
                    level = 100;
                }
                if(entryMode == "DE" || entryMode == "Transfer")
                    {
                        level = 200;
                    }
            //Save student's data
            const studentData = await new enrollDB({
                matricNo: matric_no, 
                name: 
                {
                    firstName,
                    middleName,
                    lastName
                },
                dob,
                email,
                level,
                entryMode
        });
            await studentData.save();

            return res.status(201).json({
                Message: "Student enrolled successfully",
                Matric: studentData.matricNo,
                Name: studentData.name,
                DoB: studentData.dob,
                Email: studentData.email,
                Level: studentData.level,
                EntryMode: studentData.entryMode
        });

        } catch (error) {
            return res.status(400).json({Message: "Something went wrong: " + error.message});
        } 
    },

    //API for viewing all enrolled students
    viewenrolledstudent: async function (req, res)
    {
        try {
            const allStudents = await enrollDB.find({}, {matricNo: 1, name: 1, dob: 1, email: 1, level: 1, entryMode: 1, _id: 0});

        if(!allStudents)
        {
            return res.status(404).json({Message: "No student found."});
        }

        return res.status(200).json({Message: "Success",
            Results: allStudents});

        } catch (error) {
            return res.status(400).json({Message: "Something went wrong: " + error.message});
        }
    },

    //Milestone 3
    //API for course registration
    courseregistration: async function(req, res)
    {
        const {matric_no, course_code} = req.body;
        if(!matric_no || !course_code)
        {
            return res.status(400).json({Message: "All fields are required"});
        }
        
        //Check whether student has been enrolled
        const findStudent = await enrollDB.findOne({matricNo: matric_no});
        if(!findStudent)
        {
            return res.status(404).json({Message: "Error: Student not found"})
        }

        //Check whether course is available for enrollment
        const findCourse = await coursedb.findOne({code: course_code});
        if(!findCourse)
        {
            return res.status(404).json({Message: "Error: Course not found. Check available courses"});
        }

        //Check whether course has already been registered
        const dupCourse = await enrollDB.findOne({
            $and: [
                {matricNo: matric_no}, 
                {code: course_code}
            ]
        });
        console.log(dupCourse);
        if(dupCourse)
        {
            return res.status(400).json({Message: dupCourse + " has already been registered"});
        }

        //Insert course registration in student's record
        await enrollDB.updateOne({matricNo: matric_no}, {$push: {
            course: {
                code: findCourse.code, 
                title: findCourse.title, 
                unit: findCourse.unit, 
                semester: findCourse.semester
            }
        }});

        return res.status(201).json({Message: "Success!" + " " + findCourse.code + " was registered." });
    },

    //API for viewing one enrolled student by course
    viewstudentsbycourse: async function(req, res)
    {
        try {
            const {course} = req.body;

            if(!course)
            {
                return res.status(400).json({Message: "Please specify a course to view students enrolled"});
            }

            const getCourse = await coursedb.findOne({code: course});
            if(!getCourse)
            {
                return res.status(404).json({Message: course + " is not available"})
            }

            const studentsByCourse = await enrollDB.findOne({course_code: course});

        if(!studentsByCourse)
        {
            return res.status(404).json({Message: "No student enrolled for " + course});
        }

        return res.status(200).json({
            Matric: studentsByCourse.matricNo,
            Name: studentsByCourse.firstName + " " + studentsByCourse.lastName,
            Level: studentsByCourse.level,
            Email: studentsByCourse.email,
            Course: studentsByCourse.course_code + ": " + studentsByCourse.course_title
        });
        
        } catch (error) {
            return res.status(400).json({Message: "Something went wrong: " + error.message});
        }
    },

    //Milestone 4
    //API to enable students view courses enrolled for
    viewcourseenrollment: async function(req, res)
    {
        const {matric_no} = req.body;

        if(!matric_no)
        {
            return res.status(400).json({Message: "Enter your matriculation number"});
        }

        //Verify if student is enrolled
        const isEnrolled = await enrollDB.findOne({matricNo: matric_no}, {_id: 0});
        if(!isEnrolled)
        {
            return res.status(404).json({Message: "Error: Student not enrolled yet"});
        }

        return res.status(200).json({Message: "Success",
        isEnrolled}
        )
    },

    //API for viewing course details
    getcoursedetails: async function(req, res)
    {
        const allCourses = await coursedb.find({}, {code: 1, title: 1, unit: 1, semester: 1, completion: 1, _id: 0});
        
        if(!allCourses)
        {
            return res.status(404).json({Message: "Sorry! No course found"});
        }
        return res.status(200).json({allCourses});
    }
};
