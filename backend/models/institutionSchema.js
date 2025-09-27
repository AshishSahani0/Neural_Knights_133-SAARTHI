import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    instituteName: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      maxlength: [100, "Institution name cannot exceed 100 characters"],
    },
    emailDomain: {
      type: String,
      required: [true, "Email domain is required"],
      unique: true,
      lowercase: true,
      trim: true,
      
    },
    collegeCode: {
      type: String,
      required: [true, "College code is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    contactEmail: {
      type: String,
      required: [true, "Institute admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email for institute login"],
    },
    contactPhone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Contact phone must contain 10 to 15 digits"],
    },
    logo: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Institution = mongoose.model("Institution", institutionSchema);
export default Institution;