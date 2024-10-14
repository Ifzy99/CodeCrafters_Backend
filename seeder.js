const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env var
dotenv.config({ path: "./config/config.env" });

// Load  models
const Programme = require("./models/Programme");
const Course = require("./models/Course");

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

//Read JSON files
const programmes = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/programmes.json`, "utf-8")
  );
  const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
  );


  // Import into DB
const importData = async () => {
    try {
      await Programme.create(programmes);
      await Course.create(courses);
      console.log("Data Imported...".green.inverse);
      process.exit();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Data
const deleteData = async () => {
    try {
      await Programme.deleteMany();    
      await Course.deleteMany();
      console.log("Data Destroyed...".red.inverse);
      process.exit();
    } catch (err) {
      console.error(err);
    }
  };


  if (process.argv[2] === "-i") {
    importData();
  } else if (process.argv[2] === "-d") {
    deleteData();
  }