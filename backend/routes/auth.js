import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../model/User.js";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

// Google Login
router.post("/google", async (req, res) => {
  try {
    console.log("/google route hit");

    const { token } = req.body;

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Check if user already exists
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create new user
      user = new User({
        name: payload.name,
        email: payload.email,
        role: payload.role || "hr",
      });
      await user.save();
      console.log("New Google user saved:", user.email);
    } else {
      console.log("User already exists:", user.email);
    }

    // Generate JWT
    const appToken = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Google login successful",
      token: appToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ error: "Invalid Google token" });
  }
});

//Manual Login
router.post("/login", async (req, res) => {
  try {
    console.log("/login route hit, body:", req.body);

    const { name, email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({ name, email, role: "hr" });
      await user.save();
      console.log("New manual user saved:", user.email);
    } else {
      console.log("Manual login, user already exists:", user.email);
    }

    // Generate JWT
    const appToken = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Manual login successful",
      token: appToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Manual login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});



export default router;
