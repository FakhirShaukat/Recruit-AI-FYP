import express from "express";
import jwt from "jsonwebtoken";
import adminAuth from "../middleware/adminAuth.js";
import User from "../model/User.js";
import Candidate from "../model/Candidates.js";

const router = express.Router();

// Admin Login Route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Generate JWT
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid admin credentials" });
});
router.get("/adminpanel", adminAuth, (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard 🚀" });
});

// GET all HR users
router.get("/hrs", adminAuth, async (req, res) => {
  try {
    const hrUsers = await User.find({ role: "hr" }).select("-password");
    res.json(hrUsers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/resumes", adminAuth, async (req, res) => {
  try {
    const candidates = await Candidate.find().populate("jobId", "title");

    const formatted = candidates.map(c => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      jobTitle: c.jobId ? c.jobId.title : "N/A",
      resumeUrl: `http://localhost:5000/${c.resume}`
    }));

    res.json(formatted);

  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({ message: "Server error fetching resumes" });
  }
});







export default router;
