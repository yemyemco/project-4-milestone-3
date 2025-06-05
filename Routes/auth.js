const express = require("express");
const authCtrl = require("../Controllers/authCtrl");
const authToken = require("../middleware/auth");
const router = express.Router();
    
//API for sign up
router.post("/sign-up", authCtrl.signup);

//API for sign in
router.post("/sign-in", authCtrl.signin);

//API for creating courses
router.post("/create-course", authToken.verifyToken, authCtrl.createcourse);

//API for enrolling students
router.post("/enroll-student", authCtrl.enrollstudent);

//API for view all enrolled students
router.get("/view-enrolled-students", authCtrl.viewenrolledstudent);

//API for viewing one enrolled student by course
router.post("/view-students-by-course", authCtrl.viewstudentsbycourse);

//Milestone 3
//API for viewing course details
//Course completion status added
router.get("/get-course-details", authCtrl.getcoursedetails);

//API to enable students view courses enrolled for
router.post("/view-course-enrollment", authCtrl.viewcourseenrollment);

//API for course registration
router.post("/course-registration", authCtrl.courseregistration);

module.exports = router;
