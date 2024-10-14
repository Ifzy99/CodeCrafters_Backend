const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title']
      },
      description: {
        type: String,
        required: [true, 'Please add a course description']
      },
      duration: {
        type: String, 
        required: [true, 'Please add the course duration'],
        enum: ["3 Months", "6 Months", "1 Year"]
      },
      tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
      },
      scholarshipAvailable: {
        type: Boolean,
        default: false
      },
      photo: {
        type: String,
        default: "no-photo.jpg",
      },
      programme:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
     },
     students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
    },
  ],
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
      
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Course", CourseSchema);