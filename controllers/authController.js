const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");



// @desc    Register an admin
// @route   POST /api/auth/admins/register
// @access  Private (Admin Only)
exports.registerAdmin = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    // Ensure the current user is an admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('You are not authorized to register an admin', 403));
    }

    // Create the admin user
    const user = await User.create({ name, email, password, phone, role: "admin" });

    sendTokenResponse(user, 200, res);
});


// @desc      Login User (Admin, Staff, or Student)
// @route     POST /api/auth/login
// @access    Public
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Ensure the role is correct (optional)
    const rolesAllowed = ['admin', 'staff', 'student'];
    if (!rolesAllowed.includes(user.role)) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});


// @desc   Register a student
// @route  POST /api/auth/students/register
//access   Public
exports.register= asyncHandler(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    //create user
    const user = await User.create({ name, email, password,phone, role: "student" });

    sendTokenResponse(user, 200, res);
})



// @desc      Get current Logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id);

      res.status(200).json({
        success: true,
        data: user
      });
})


// @desc    Register a staff
// @route   POST /api/auth/staffs/register
// @access  Public
exports.registerStaff = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

     //create user
     const user = await User.create({ name, email, password,phone, role: "staff" });

     
    sendTokenResponse(user, 200, res);
})




// @desc      Forgot password
// @route     POST /api/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

})



//Get token from model,create cookie & send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
  
    // Make cookie last for 30 days
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
        };
        
        if (process.env.NODE_ENV === 'production') {
            options.secure = true;
                    };
  
  
            // Store cookie
            res
            .status(statusCode)
            .cookie('token', token, options)
            .json({success:true, _id:user._id, name:user.name, email:user.email, role:user.role, token});
  }