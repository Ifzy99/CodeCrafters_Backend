const mongoose = require('mongoose');
const Programme = require('./models/Programme'); // Adjust the path to your model
const connectDB = require('./config/db'); // Adjust based on your project

//Load env variables
require('dotenv').config({ path: "./config/config.env"});



// Connect to MongoDB
connectDB();

const updateProgrammePhotoPaths = async () => {
  try {
    const programmes = await Programme.find({});
    
    // Update each programme's photo path
    await Promise.all(programmes.map(async (programme) => {
      if (programme.photo && !programme.photo.startsWith('/uploads/')) {
        await Programme.findByIdAndUpdate(programme._id, {
          photo: `/uploads/${programme.photo}`
        });
      }
    }));

    console.log('Photo paths updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating photo paths:', error);
    process.exit(1);
  }
};

updateProgrammePhotoPaths();
