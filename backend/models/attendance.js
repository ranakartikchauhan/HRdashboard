import mongoose,{Schema} from "mongoose";

const attendanceSchema = new  mongoose.Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    task: { type: String},
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
