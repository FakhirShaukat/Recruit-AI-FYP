import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  resume: { type: String, required: true }, // resume file path or URL
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Candidate", candidateSchema);
