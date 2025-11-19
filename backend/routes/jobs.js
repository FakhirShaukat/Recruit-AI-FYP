import express from "express";
import Job from "../model/Job.js";
import Candidate from "../model/Candidates.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get a single job by ID (no authentication required)
router.get("/public/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get jobs for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({ userEmail: req.user.email });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add job
router.post("/", verifyToken, async (req, res) => {
  try {
    const job = new Job({ ...req.body, userEmail: req.user.email });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit job
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userEmail: req.user.email },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete job
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      userEmail: req.user.email,
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const result = await Candidate.deleteMany({ jobId: req.params.id });
    console.log(`Deleted ${result.deletedCount} candidates for job ${req.params.id}`);

    res.json({
      message: "Job and related resumes deleted successfully",
      deletedResumes: result.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ error: "Failed to delete job and related resumes" });
  }
});


export default router;
