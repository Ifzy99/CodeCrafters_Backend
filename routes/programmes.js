const express = require("express");
const router = express.Router();
const {getProgrammes,createProgramme,getProgramme,updateProgramme,deleteProgramme, programmePhotoUpload} = require("../controllers/programmeController");

const Programme = require("../models/Programme");
const advancedResults = require("../middleware/advancedResults");

// Include other resource routes
const courseRouter = require("./courses");

const {protect,authorize} = require("../middleware/auth");

//Re-route into other resource routers
router.use("/:programmeId/courses", courseRouter);

router.route("/:id/photo").put(protect, authorize("admin"), programmePhotoUpload);


                     
router.route("/").get(advancedResults(Programme, "courses"),getProgrammes)
                 .post(protect, authorize("admin"),  createProgramme);

router.route("/:id").get(getProgramme)
                     .put(protect,authorize("staff", "admin"), updateProgramme)
                     .delete(protect, authorize("admin"), deleteProgramme)

module.exports = router
