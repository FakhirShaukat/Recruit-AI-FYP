import express from "express";

const router = express.Router();

router.get("/me", async (req, res) => {
  try {
    // Assuming you identify HR via token or session
    const hr = await HrModel.findOne({ email: req.user.email });
    res.json(hr);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch HR info" });
  }
});

export default router;