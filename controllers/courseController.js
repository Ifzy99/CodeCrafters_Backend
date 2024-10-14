const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require('../config/cloudinary');
const Programme = require("../models/Programme");
const Course  = require("../models/Course");



//@desc  Get student courses
//@desc   GET /api/courses
//@desc   GET /api/programmes/:programmeId/courses
//@access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.programmeId) {
        const courses = await  Course.find({ programme: req.params.programmeId });
   
        return res.status(200).json({
            sucess:true,
            count: courses.length,
            data: courses
          });
      }else{
         
        res.status(200).json(res.advancedResults);
      }
})


//@desc   Get single course
//@route  GET /api/courses/:id
//access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: "programme",
        select: "name description"
    });

    if (!course) {
      return next(
        new ErrorResponse(
          `Programme not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({ success: true, data: course });
});



//@desc  Add course
//@route  POST /api/v1/programmes/:programmeId/courses
//access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.programme = req.params.programmeId;
    req.body.user = req.user.id;

    const programme = await Programme.findById(req.params.programmeId)

    if (!programme) {
        return next(
          new ErrorResponse(
            `No programme with the id of ${req.params.programmeId}`,
            404
          )
        );
      }


    const course = await Course.create(req.body);

    res.status(200).json({ success: true, data: course });
});



// @desc      Attach staff to course
// @route     PUT /api/courses/:id/addStaff
// @access    Private (Staff Only)
exports.addStaffToCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if the user has the 'staff' role
  if (req.user.role !== 'staff') {
    return next(
      new ErrorResponse('Only staff members can be attached to courses', 403)
    );
  }

  // Attach the staff to the course
  course.staff = req.user.id;

  await course.save();

  res.status(200).json({ success: true, data: course });
})




// @desc      Enroll student in course
// @route     PUT /api/courses/:id/enroll
// @access    Private (Student Only)
exports.enrollStudentInCourse = asyncHandler(async (req, res, next) => {

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404))
    }

    // Check if the user has the 'student' role
      if (req.user.role !== 'student') {
        return next(
          new ErrorResponse('Only students can enroll in courses', 403)
        );
      }

      // Check if the user is already enrolled in the course
      if (course.students.includes(req.user.id)) {
        return next(new ErrorResponse('You are already enrolled in this course', 400))
        }

        // Add the user to the enrolledStudents array
        course.students.push(req.user.id);
        await course.save();

        res.status(200).json({ success: true, data: course });
      
})




// @desc      Update course
// @route     PUT /api/courses/:id
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(
          new ErrorResponse(`No course with the id of ${req.params.id}`),
          404
        );
      }


      course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    
      res.status(200).json({
        success: true,
        data: course
      });
})


// @desc      Delete course
// @route     DELETE /api/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
  
    if (!course) {
      return next(
        new ErrorResponse(`No course with the id of ${req.params.id}`),
        404
      );
    }

     await course.deleteOne();
     
    res.status(200).json({
      success: true,
      data: {}
    });
  });



// @desc      Upload photo for course
// @route     PUT /api/courses/:id/photo
// @access    Private
exports.coursePhotoUpload = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if file is provided
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  try {
    // Upload to Cloudinary using the file buffer (binary data)
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'courses', // Optional folder in Cloudinary
        public_id: `photo_${course._id}`, // Custom filename
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary error:', error);
          return next(new ErrorResponse('Problem with file upload', 500));
        }

        // Update programme with the new photo URL
        Course.findByIdAndUpdate(req.params.id, { photo: result.secure_url })
          .then(() => {
            res.status(200).json({
              success: true,
              data: result.secure_url,
            });
          })
          .catch((err) => {
            console.error('Database update error:', err);
            return next(new ErrorResponse('Problem with database update', 500));
          });
      }
    ).end(file.data); // Use `file.data` for buffer data
  } catch (err) {
    console.error(err);
    return next(new ErrorResponse('Problem with file upload', 500));
  }
});
  




