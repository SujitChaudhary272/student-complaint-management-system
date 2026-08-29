import mongoose from "mongoose";
import Counter from "./Counter.js";

const categories = ["Hostel", "Library", "Canteen", "Transport", "Classroom", "Laboratory", "Internet/Wi-Fi", "Other"];

const complaintSchema = new mongoose.Schema({
  complaintCode: { type: String, unique: true, index: true },
  prnNo: { type: String, required: true, trim: true, maxlength: 30 },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  title: { type: String, required: true, trim: true, minlength: 4, maxlength: 120 },
  category: { type: String, required: true, enum: categories },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  location: { type: String, trim: true, maxlength: 150 },
  priority: { type: String, required: true, enum: ["Low", "Medium", "High", "Critical"] },
  status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" }
}, { timestamps: true });

complaintSchema.pre("save", async function assignCode(next) {
  if (!this.isNew || this.complaintCode) return next();

  try {
    // Bring the sequence forward when this is an existing database created
    // before counters were introduced. Counting documents is unsafe because
    // deletions make old codes available again.
    const existingCodes = await this.constructor.find({ complaintCode: /^CMP-\d+$/ })
      .select("complaintCode -_id")
      .lean();
    const highestExistingCode = existingCodes.reduce((highest, { complaintCode }) =>
      Math.max(highest, Number(complaintCode.slice(4))), 1000);

    await Counter.updateOne(
      { name: "complaintCode" },
      { $max: { value: highestExistingCode } },
      { upsert: true }
    );
    const counter = await Counter.findOneAndUpdate(
      { name: "complaintCode" },
      { $inc: { value: 1 } },
      { new: true }
    );
    this.complaintCode = `CMP-${String(counter.value).padStart(4, "0")}`;
    next();
  } catch (error) {
    next(error);
  }
});

export { categories };
export default mongoose.model("Complaint", complaintSchema);
