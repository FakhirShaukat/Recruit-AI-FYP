import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: String,
  skills: String,
  education: String,
  experience: String,
  salaryexpectation: String,
  jobtype: String,
  location: String,
  userEmail: { type: String, required: true },
});



export default mongoose.model("Job", jobSchema);