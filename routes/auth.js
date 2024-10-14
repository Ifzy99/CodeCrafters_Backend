const express = require("express")
const {registerAdmin,register, getMe, registerStaff,  forgotPassword, loginUser} = require ("../controllers/authController");

const router = express.Router();

const {  protect, authorize } = require("../middleware/auth");

router.post('/admins/register', protect, authorize("admin"), registerAdmin);
router.post('/login', loginUser);
router.post("/forgotpassword", forgotPassword);


//Student Routes
router.post("/students/register", register);
router.get("/students/me", protect, getMe);

// Staff Routes
router.post('/staffs/register', registerStaff);





module.exports = router;