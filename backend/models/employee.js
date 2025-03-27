import mongoose from "mongoose";

// Employee Schema
const employeeSchema = new mongoose.Schema(
  {
    profile: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    position: { type: String, required: true },
    department: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
