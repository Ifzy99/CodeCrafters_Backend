const asyncHandler = require("../middleware/async");
const Student = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//@desc      Register a new Student
//@route     POST/api/students
//@access    Public
exports.registerStudents = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  //Validation
  if (!name || !email || !password || !phone) {
    return next(new ErrorResponse("Please fill in all fields", 400));
  }

  //Check for existing user
  const studentExists = await Student.findOne({ email });
  if (studentExists) {
    return next(new ErrorResponse("Student already exists", 400));
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //Create student
  const student = await Student.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  if (student) {
    res
      .status(201)
      .json({
        success: true,
        _id: student._id,
        name: student.name,
        email: student.email,
        token: generateToken(student._id),
      });
  } else {
    return next(new ErrorResponse("Invalid student data", 400));
  }
});

//@desc      Login a  Student
//@route     POST/api/students/login
//@access    Public
exports.loginStudent = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const student = await Student.findOne({ email }).select("+password");

  if (!student) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //Check if password matches
  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Send response
  res
    .status(200)
    .json({
      success: true,
      _id: student._id,
      name: student.name,
      email: student.email,
      token: generateToken(student._id),
    });
});

//@desc      Get current student
//@route     GET/api/students/me
//@access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const student = {
    id: req.student._id,
    email: req.student.email,
    name: req.student.name,
  };
  res.status(200).json({ success: true, data: student });
});

//Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

