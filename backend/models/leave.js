import mongoose,{Schema} from "mongoose";
// Leave Schema (Linked to Employee)
const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      default: "Pending",
    },
    docs: { type: String },
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
