const path = require("path");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Programme = require("../models/Programme");
const cloudinary = require('../config/cloudinary');


// @desc  Get all programmes
//@route  GET /api/programmes
//access  Public
exports.getProgrammes = asyncHandler(async (req, res, next) => {
    const programmes = await Programme.find();

    res.status(200).json(res.advancedResults);
})


//@desc   Get single programme
//@route  GET /api/programmes/:id
//access  Public
exports.getProgramme = asyncHandler(async (req, res, next) => {
    const programme = await Programme.findById(req.params.id);
    if(!programme){
        return next(new ErrorResponse(`Programme not found with id of ${req.params.id}`, 404
            ));
        }

        res.status(200).json({ success: true, data: programme });
})



//@desc   Create new programme
//@route  POST /api/programmes/:id
//access  Private
exports.createProgramme = asyncHandler(async (req, res, next) => {
       // Add user to req.body
       req.body.user = req.user.id;

    const programme = await Programme.create(req.body);

    res.status(201).json({ success: true, data: programme });
})


//@desc   Update programme
//@route  PUT /api/programmes/:id
//access  Private
exports.updateProgramme = asyncHandler(async (req, res, next) => {
    let programme = await Programme.findById(req.params.id);

    if(!programme){
        return next(new ErrorResponse(`Programme not found with id of ${req.params.id}`, 404
            ));
            }

           programme = await Programme.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
              })

              res.status(200).json({ success: true, data: programme });
})


//@desc   Delete programme
//@route  DELETE /api/programmes/:id
//access  Private
exports.deleteProgramme = asyncHandler(async (req, res, next) => {
    const programme = await Programme.findById(req.params.id);

    if (!programme) {
        return next(
          new ErrorResponse(
            `Programme not found with the id of ${req.params.id}`,
            404
          )
        );
      }

      programme.deleteOne();

      res.status(200).json({ success: true, data: {} });
})



// @desc      Upload photo for programme
// @route     PUT /api/programmes/:id/photo
// @access    Private
exports.programmePhotoUpload = asyncHandler(async (req, res, next) => {
    const programme = await Programme.findById(req.params.id);
  
    if (!programme) {
      return next(new ErrorResponse(`Programme not found with id of ${req.params.id}`, 404));
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
          folder: 'programmes', // Optional folder in Cloudinary
          public_id: `photo_${programme._id}`, // Custom filename
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            return next(new ErrorResponse('Problem with file upload', 500));
          }
  
          // Update programme with the new photo URL
          Programme.findByIdAndUpdate(req.params.id, { photo: result.secure_url })
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