import mongoose from "mongoose";
import { config } from "./config.js";
import User from "./models/User.js";
import Complaint from "./models/Complaint.js";

export async function ensureAdminAccount() {
  let admin = await User.findOne({ username: config.adminUsername }).select("+password");
  if (!admin) {
    admin = await User.create({ username: config.adminUsername, password: config.adminPassword, fullName: "PCCOE Administrator", role: "admin" });
  } else if (admin.role !== "admin" || !(await admin.comparePassword(config.adminPassword))) {
    admin.fullName = "PCCOE Administrator";
    admin.role = "admin";
    admin.password = config.adminPassword;
    await admin.save();
  }
  return admin;
}

export async function seedDemoData() {
  let student = await User.findOne({ username: "student" });
  if (!student) student = await User.create({ username: "student", password: "student123", fullName: "Demo Student", role: "student" });
  await ensureAdminAccount();
  if (await Complaint.countDocuments() === 0) await Complaint.insertMany([
    { complaintCode: "CMP-1001", prnNo: "DEMO-PRN-001", student: student._id, studentName: student.fullName, title: "Water leakage in hostel room", category: "Hostel", description: "There is continuous water leakage near the washroom pipe in Room 214.", location: "Hostel Block B, Room 214", priority: "High", status: "Pending" },
    { complaintCode: "CMP-1002", prnNo: "DEMO-PRN-001", student: student._id, studentName: student.fullName, title: "Wi-Fi not working in library", category: "Internet/Wi-Fi", description: "The Wi-Fi connection drops every few minutes in the reading hall.", location: "Central Library, 2nd Floor", priority: "Medium", status: "In Progress" }
  ]);
}

if (process.argv[1].endsWith("seed.js")) mongoose.connect(config.mongoUri).then(seedDemoData).then(() => mongoose.disconnect());
