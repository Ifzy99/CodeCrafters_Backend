const path = require("path");
const express = require('express');
const dotenv = require("dotenv");
const morgan = require("morgan");
const errorHandler = require("./middleware/error");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cors = require('cors')
const connectDB = require('./config/db');


//Load env variables
dotenv.config({ path: "./config/config.env"});

//Connect to database
connectDB();


//Import Route files
const programmes = require("./routes/programmes")
const courses = require("./routes/courses")
const auth = require('./routes/auth');
const users = require('./routes/users');

// Initialize the app variable
const app = express();

// Use middleware
app.use(cors());

//Body Parser
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Cookie Parser
app.use(cookieParser());



///Dev logging middleware
if(process.env.NODE_ENV === "development"){
  app.use(morgan("dev"));
}

//File uploading
app.use(fileupload());

//Set static folder
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

//Mount routes
app.use("/api/programmes", programmes)
app.use("/api/courses", courses);
app.use("/api/auth", auth);
app.use("/api/users", users);

app.use(errorHandler);



const PORT = process.env.PORT || 8000

const server = 
app.listen(PORT, (
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
));

//Handle Unhandled Promise Rejection
process.on("unhandledRejection",(err, promise) => {
  console.log(`Error: ${err.message}`.red);
//Close server & exit process
server.close(() => process.exit(1));    
 });
