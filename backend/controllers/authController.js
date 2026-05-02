const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { generateToken } = require("../middleware/auth");
const {
  sendPasswordResetOtpEmail,
  sendPasswordResetConfirmationEmail,
} = require("../emailService");

const JWT_SECRET = process.env.JWT_SECRET;

// Separate in-memory stores — completely independent from candidate OTP flow
const adminOtpStore = new Map();

// ─── Existing ────────────────────────────────────────────────────────────────

const register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(404).json({ success: false, message: "No account found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    adminOtpStore.set(email, { otp, expiry: Date.now() + 5 * 60 * 1000, attempts: 0 });

    await sendPasswordResetOtpEmail(email, otp, user.name || email);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = adminOtpStore.get(email);

    if (!record)
      return res.status(400).json({ success: false, message: "OTP expired or not requested" });

    if (Date.now() > record.expiry) {
      adminOtpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP has expired. Request a new one." });
    }

    record.attempts += 1;
    if (record.attempts > 3) {
      adminOtpStore.delete(email);
      return res.status(400).json({ success: false, message: "Too many failed attempts. Request a new OTP." });
    }

    if (record.otp !== otp)
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. ${3 - record.attempts} attempt${3 - record.attempts === 1 ? "" : "s"} remaining.`,
      });

    adminOtpStore.delete(email);

    const resetToken = jwt.sign(
      { email, purpose: "admin-password-reset" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: "Reset link expired or invalid" });
    }

    if (decoded.purpose !== "admin-password-reset")
      return res.status(400).json({ success: false, message: "Invalid reset token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashed },
    });

    await sendPasswordResetConfirmationEmail(decoded.email, user.name || decoded.email);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, forgotPassword, verifyResetOtp, resetPassword };
