import mongoose from "mongoose";
import { Router } from "express";
import Complaint, { categories } from "../models/Complaint.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const statuses = ["Pending", "In Progress", "Resolved"];
const priorities = ["Low", "Medium", "High", "Critical"];

router.use(authenticate);
router.get("/meta", (_req, res) => res.json({ categories, statuses, priorities }));

router.get("/stats", async (req, res, next) => {
  try {
    const filter = req.user.role === "student"
      ? { student: new mongoose.Types.ObjectId(req.user.id) }
      : {};
    const rows = await Complaint.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
    const stats = { total: 0, pending: 0, inProgress: 0, resolved: 0 };
    rows.forEach(({ _id, count }) => { stats.total += count; if (_id === "Pending") stats.pending = count; if (_id === "In Progress") stats.inProgress = count; if (_id === "Resolved") stats.resolved = count; });
    res.json(stats);
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const filter = req.user.role === "student" ? { student: req.user.id } : {};
    if (statuses.includes(req.query.status)) filter.status = req.query.status;
    if (categories.includes(req.query.category)) filter.category = req.query.category;
    if (req.query.q?.trim()) { const expression = new RegExp(req.query.q.trim(), "i"); filter.$or = [{ title: expression }, { complaintCode: expression }, { prnNo: expression }, { studentName: expression }]; }
    res.json(await Complaint.find(filter).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.post("/", authorize("student"), async (req, res, next) => {
  try {
    const { prnNo, title, category, description, location, priority } = req.body;
    if (!prnNo?.trim()) return res.status(400).json({ message: "Enter your PRN number." });
    if (!categories.includes(category) || !priorities.includes(priority)) return res.status(400).json({ message: "Choose a valid category and priority." });
    const complaint = await Complaint.create({ prnNo: prnNo.trim(), title, category, description, location, priority, student: req.user.id, studentName: req.user.fullName });
    res.status(201).json(complaint);
  } catch (error) { next(error); }
});

router.patch("/:id/status", authorize("admin"), async (req, res, next) => {
  try {
    if (!statuses.includes(req.body.status)) return res.status(400).json({ message: "Choose a valid status." });
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json(complaint);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    const isAdmin = req.user.role === "admin";
    const isOwner = complaint.student.toString() === req.user.id;
    if (!isAdmin && !isOwner) return res.status(403).json({ message: "You can only delete your own complaint." });
    if (isAdmin && complaint.status !== "Resolved") return res.status(409).json({ message: "Administrators can delete only resolved complaints." });
    if (!isAdmin && complaint.status === "Resolved") return res.status(409).json({ message: "Resolved complaints can no longer be deleted." });
    await complaint.deleteOne();
    res.json({ message: "Complaint deleted.", id: req.params.id });
  } catch (error) { next(error); }
});

export default router;
