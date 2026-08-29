import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const publicUser = (user) => ({ id: user._id, username: user.username, fullName: user.fullName, role: user.role });
const tokenFor = (user) => jwt.sign({ id: user._id, username: user.username, fullName: user.fullName, role: user.role }, config.jwtSecret, { expiresIn: "8h" });

router.post("/register", async (req, res, next) => {
  try {
    const fullName = req.body.fullName?.trim();
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password || "";
    if (!fullName || fullName.length < 2) return res.status(400).json({ message: "Enter your full name." });
    if (!username || username.length < 3) return res.status(400).json({ message: "Username must have at least 3 characters." });
    if (username === "pccoe") return res.status(403).json({ message: "This username is reserved for the administrator account." });
    if (password.length < 8) return res.status(400).json({ message: "Password must have at least 8 characters." });
    if (await User.exists({ username })) return res.status(409).json({ message: "That username is already registered." });
    const user = await User.create({ fullName, username, password, role: "student" });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password || "";
    const portalRole = req.body.portalRole;
    if (!['student', 'admin'].includes(portalRole)) return res.status(400).json({ message: "Choose a valid login portal." });
    if (portalRole === "admin" && (username !== config.adminUsername || password !== config.adminPassword)) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    if (username === config.adminUsername && portalRole !== "admin") return res.status(401).json({ message: "Invalid username or password." });
    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await user.comparePassword(password)) || user.role !== portalRole) return res.status(401).json({ message: "Invalid username or password." });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "Account not found." });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

export default router;
