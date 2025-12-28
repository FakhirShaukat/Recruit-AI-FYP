import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import Candidate from "../model/Candidates.js";
import Job from "../model/Job.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Save candidate and uploaded resume
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { jobId, name, email, phone } = req.body;
    const resumePath = req.file ? req.file.path : null;

    if (!resumePath) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    const candidate = new Candidate({
      jobId,
      name,
      email,
      phone,
      resume: resumePath,
    });

    await candidate.save();
    res.status(201).json({ message: "Candidate saved successfully" });
  } catch (error) {
    console.error("Error saving candidate:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all candidates (resumes) for a specific job
router.get("/job/:jobId", async (req, res) => {
  try {
    const candidates = await Candidate.find({ jobId: req.params.jobId });
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get total count of uploaded resumes
router.get("/count", async (req, res) => {
  try {
    const count = await Candidate.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching resume count:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get total resumes for all jobs posted by a specific HR (based on email)
router.get("/count/:hrEmail", async (req, res) => {
  try {
    const hrEmail = req.params.hrEmail;

    // Find all jobs posted by this HR
    const jobs = await Job.find({ userEmail: hrEmail }).select("_id");

    // Extract job IDs
    const jobIds = jobs.map((job) => job._id);

    // Count all candidates whose jobId is in those jobIds
    const totalApplications = await Candidate.countDocuments({
      jobId: { $in: jobIds },
    });

    res.json({ count: totalApplications });
  } catch (error) {
    console.error("Error fetching applications count:", error);
    res.status(500).json({ error: error.message });
  }
});


// Delete candidate + resume
router.delete("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // 🛡 Safe resume file deletion
    if (candidate.resume) {
      const filePath = path.normalize(candidate.resume);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Candidate.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("DELETE CANDIDATE ERROR:", error);
    res.status(500).json({ message: "Server error while deleting candidate" });
  }
});




export default router;
