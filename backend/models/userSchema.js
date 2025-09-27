import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxlength: [100, "Username cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    passwordUpdated: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Student", "CollegePsychologist", "InstitutionAdmin", "MainAdmin"],
      default: "Student",
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: function () {
        return this.role !== "MainAdmin";
      },
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Ensures email is unique within an institution (e.g., two students in the same college cannot share an email)
userSchema.index({ email: 1, institution: 1 }, { unique: true });

// Generate 6-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
  this.verificationCode = code;
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  return code;
};

// Generate JWT
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1h",
  });
};
userSchema.methods.getRefreshJWTToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d", // Recommended to be longer
  });
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes validity
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;