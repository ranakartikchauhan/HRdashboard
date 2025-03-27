import mongoose from "mongoose";

// Candidate Schema (Standalone)
const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    position: { type: String, required: true },
    status: {
      type: String,
      required: true,
    },
    experience: { type: String, required: true },
    resume: { type: String, required: true },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
