const express = require("express");

const {getCourses, addCourse, getCourse, updateCourse, deleteCourse, enrollStudentInCourse, addStaffToCourse, coursePhotoUpload} = require("../controllers/courseController");

const Course = require("../models/Course");

const router = express.Router({mergeParams: true});

const advancedResults = require("../middleware/advancedResults");


const {protect, authorize} = require("../middleware/auth");

router.route("/:id/photo").put(protect, authorize("admin"), coursePhotoUpload);


router.route("/").get(advancedResults(Course, {
    path: "programme",
    select: "name description"
}), getCourses).post(protect, authorize("admin"), addCourse)

// Enroll a student in a course
router.route("/:id/enroll").put(protect, authorize("student"), enrollStudentInCourse);

//Add staff to a course
router.route("/:id/addStaff").put(protect, authorize("staff", "admin"), addStaffToCourse);

router.route("/:id").get(getCourse).put(protect, authorize("staff", "admin"), updateCourse).delete(protect, authorize("staff", "admin"), deleteCourse)


module.exports = router