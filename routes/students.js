const express = require('express');
const {registerStudents,loginStudent, getMe} = require("../controllers/studentController");

const router = express.Router();

const {protect} = require("../middleware/auth")



router.route("/register").post( registerStudents);
router.route("/login").post(loginStudent);
router.route("/me").get(protect, getMe);


module.exports = router;