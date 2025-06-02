const express = require("express");
const router = express.Router();
const { signup, 
    signin,
    createcourse, 
    enrollstudent, 
    viewenrolledstudents,
    courseregistration,
    viewstudentsbycourse,
    viewcourseenrollment,
    getcoursedetails } = require("../Controllers");
    
//API for sign up
router.post("/sign-up", signup);

//API for sign in
router.post("/sign-in", signin);

//API for creating courses
router.post("/create-course", verifytoken, createcourse);

//API for enrolling students
router.post("/enroll-student", enrollstudent);

//API for view all enrolled students
router.get("/view-enrolled-students", viewenrolledstudents);

//API for course registration
router.post("/course-registration", courseregistration);

//API for viewing one enrolled student by course
router.post("/view-students-by-course", viewstudentsbycourse);

//API to enable students view courses enrolled for
router.post("/view-course-enrollment", viewcourseenrollment);

//API for viewing course details
router.get("/get-course-details", getcoursedetails);

module.exports = router;