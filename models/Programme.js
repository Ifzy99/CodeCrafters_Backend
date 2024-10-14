const mongoose = require("mongoose");


ProgrammeSchema = new mongoose.Schema({
    name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  careers: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Cybersecurity",
      "Digital Marketing",
      "Other",
    ],
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
},
{
    timestamps: true,
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
);

//Cascade Delete
ProgrammeSchema.pre("deleteOne",{document:true, query: false}, async function(next) {
    console.log(`Courses being removed from programme ${this._id}`);
    await this.model('Course').deleteMany({programme: this._id});
    next();
    });

//Reverse populate with virtuals
ProgrammeSchema.virtual('courses', {
    ref: "Course",
    localField: "_id",
    foreignField: "programme",
    justOne: false
});


module.exports = mongoose.model("Programme", ProgrammeSchema)