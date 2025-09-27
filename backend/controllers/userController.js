import bcrypt from "bcrypt";
import User from "../models/userSchema.js";
import Institution from "../models/institutionSchema.js";
import sendEmail from "../util/sendEmail.js";
import { generateWelcomeEmailTemplate } from "../util/emailTemplate.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import mongoose from "mongoose";



// -------------------- REGISTER INSTITUTE (MainAdmin) --------------------
export const registerInstitute = async (req, res) => {
  try {
    const { instituteName, emailDomain, collegeCode, contactEmail, password } =
      req.body;

    if (
      !instituteName ||
      !emailDomain ||
      !collegeCode ||
      !contactEmail ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8-16 characters and include uppercase, lowercase, number, and a special character.",
      });
    }

    const existingInstitute = await Institution.findOne({
      $or: [{ collegeCode }, { emailDomain }, { contactEmail }],
    });

    if (existingInstitute) {
      return res.status(409).json({
        success: false,
        message:
          "Institute with this Code, Domain, or Contact Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const institute = await Institution.create({
      instituteName,
      emailDomain,
      collegeCode,
      contactEmail,
       createdBy: req.user._id,
      
    });

    const instituteAdmin = await User.create({
      username: `${instituteName} Admin`,
      email: contactEmail,
      password: hashedPassword,
      role: "InstitutionAdmin",
      institution: institute._id,
      passwordUpdated: false,
      accountVerified: true,
    });

    const html = generateWelcomeEmailTemplate({
      name: instituteName,
      email: contactEmail,
      password,
    });

    await sendEmail({
      to: contactEmail,
      subject: "Your SAARTHI Institute Admin Account is Ready",
      html,
    });

    res.status(201).json({
      success: true,
      message:
        "Institute and Admin registered successfully. Welcome email sent.",
      institute,
    });
  } catch (error) {
    console.error("Register Institute Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate entry. Please check college code, domain, or email.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error during institute registration.",
    });
  }
};

// -------------------- REGISTER PSYCHOLOGIST (InstitutionAdmin) --------------------
export const registerPsychologist = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Username, email, and password are required.",
      });
  }

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be 8-16 characters and include uppercase, lowercase, number, and a special character.",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .json({
        success: false,
        message: "A user with this email already exists.",
      });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const psychologist = await User.create({
    username,
    email,
    password: hashedPassword,
    role: "CollegePsychologist",
    institution: req.user.institution,
    passwordUpdated: false,
    accountVerified: true,
  });

  const html = generateWelcomeEmailTemplate({
    name: username,
    email,
    password,
  });
  await sendEmail({
    to: email,
    subject: "Your SAARTHI Psychologist Account is Ready",
    html,
  });

  res.status(201).json({
    success: true,
    message: "Psychologist registered successfully. Welcome email sent.",
    psychologist,
  });
};

// -------------------- GET ALL INSTITUTIONS (MainAdmin) --------------------
export const getAllInstitutions = async (req, res) => {
  try {
    // 🛡️ Check if the user is MainAdmin
    if (req.user.role !== "MainAdmin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. Only MainAdmin can view institutions.",
      });
    }

    // 📥 Get filters from query
    let { search = "", status, page = 1, limit = 10 } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    // 🔍 Build search filter
    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { instituteName: regex },
        { emailDomain: regex },
        { collegeCode: regex },
      ];
    }

    // ✅ Add status filter
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    // 📄 Pagination
    const skip = (page - 1) * limit;

    // 🔎 Query institutions
    const institutions = await Institution.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Institution.countDocuments(filter);

    // 📤 Return results
    res.status(200).json({
      success: true,
      institutes: institutions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Get All Institutions Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching institutions.",
    });
  }
};


// -------------------- GET ALL STUDENTS (MainAdmin, InstitutionAdmin, Psychologist) --------------------
export const getAllStudents = async (req, res) => {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    let institutionIds = [];

    if (req.user.role === "MainAdmin") {
      // MainAdmin gets all institutions
      const institutions = await Institution.find().select("_id");
      institutionIds = institutions.map((inst) => inst._id);
    } else if (req.user.role === "InstitutionAdmin" || req.user.role === "Psychologist") {
      // InstitutionAdmin or Psychologist gets only their institution
      if (!req.user.institution) {
        return res.status(403).json({
          success: false,
          message: "No institution assigned",
        });
      }
      institutionIds = [req.user.institution];
    } else {
      // Unauthorized access
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const userFilter = { role: "Student" };

    if (institutionIds.length > 0) {
      userFilter.institution = { $in: institutionIds };
    }

    if (search) {
      const regex = new RegExp(search, "i");

      // Match institutions by name or code for search
      const matchedInstitutions = await Institution.find({
        $or: [
          { instituteName: regex },
          { collegeCode: regex },
        ],
      }).select("_id");

      const matchedInstitutionIds = matchedInstitutions.map((inst) => inst._id);

      // Add search conditions
      userFilter.$or = [
        { username: regex },
        { email: regex },
        { institution: { $in: matchedInstitutionIds } },
      ];
    }

    // Fetch students with pagination and sorting
    const students = await User.find(userFilter)
      .populate("institution", "instituteName collegeCode")
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(userFilter);

    res.status(200).json({
      success: true,
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Get All Students Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching students.",
    });
  }
};




// -------------------- GET ALL PSYCHOLOGISTS (MainAdmin, InstitutionAdmin) --------------------
export const getAllPsychologists = async (req, res) => {
  try {
    let {
      search = "",
      collegeName = "",
      collegeCode = "",
      page = 1,
      limit = 10,
    } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const filter = { role: "CollegePsychologist" };

    // Role-based filtering
    if (req.user.role === "InstitutionAdmin") {
      filter.institution = req.user.institution;
    } else if (req.user.role === "MainAdmin") {
      const instFilter = {};

      if (collegeName)
        instFilter.instituteName = { $regex: collegeName, $options: "i" };

      if (collegeCode)
        instFilter.collegeCode = { $regex: collegeCode, $options: "i" };

      if (Object.keys(instFilter).length > 0) {
        const institutions = await Institution.find(instFilter).select("_id");
        const institutionIds = institutions.map((inst) => inst._id);

        if (institutionIds.length === 0) {
          return res.status(200).json({
            success: true,
            psychologists: [],
            total: 0,
            page: 1,
            totalPages: 0,
          });
        }

        filter.institution = { $in: institutionIds };
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Search by name/email
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { username: regex },
        { email: regex },
      ];
    }

    // Fetch psychologists with pagination
    const psychologists = await User.find(filter)
      .populate("institution", "instituteName collegeCode")
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    // Send response
    res.status(200).json({
      success: true,
      psychologists,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Get Psychologists Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching psychologists.",
    });
  }
};




// -------------------- UPDATE SELF PROFILE --------------------
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const { username, email, password } = req.body;

        // Update username
        if (username) user.username = username;

        // Update email with basic validation
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format." });
            }
            user.email = email.toLowerCase();
        }

        // Update password if provided
        if (password) {
            const strongPasswordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
            if (!strongPasswordRegex.test(password)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password must be 8-16 characters and include uppercase, lowercase, number, and special character.",
                });
            }
            user.password = await bcrypt.hash(password, 12);
            user.passwordUpdated = true;
        }

        // Update profile image if a new file is provided
        if (req.file) {
            // Check if an old profile image exists and delete it from Cloudinary
            if (user.profileImage && user.profileImage.public_id) {
                // Ensure the public ID is correctly formatted before deleting
                if (user.profileImage.public_id.startsWith('SAARTHI/profiles/')) {
                    await deleteFromCloudinary(user.profileImage.public_id);
                } else {
                    // Fallback for older, misformatted public IDs
                    await deleteFromCloudinary(user.profileImage.public_id);
                }
            }

            // Upload the new image to Cloudinary using an options object
            const result = await uploadToCloudinary(req.file.buffer, {
                folder: 'SAARTHI/profiles',
                public_id: `profile_${user._id}`,
                overwrite: true
            });
            
            user.profileImage = {
                public_id: result.public_id,
                url: result.secure_url,
            };
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user,
        });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ success: false, message: err.message || "Server error." });
    }
};

// -------------------- UPDATE PROFILE BY ADMIN --------------------
export const updateProfileByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const requesterRole = req.user.role;
    const targetRole = userToUpdate.role;
    const isMainAdmin = requesterRole === "MainAdmin";
    const isInstitutionAdmin = requesterRole === "InstitutionAdmin";

    const UPDATABLE_ROLES_BY_INSTITUTION_ADMIN = ["Student", "CollegePsychologist"];

    // ⛔ InstitutionAdmin can only update users from their own institution
    if (isInstitutionAdmin && !UPDATABLE_ROLES_BY_INSTITUTION_ADMIN.includes(targetRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this user",
      });
    }

    if (
      isInstitutionAdmin &&
      String(req.user.institution) !== String(userToUpdate.institution)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update users from your own institution",
      });
    }

    // ✅ Common updates for both roles
    if (data.username) userToUpdate.username = data.username;
    if (data.email) userToUpdate.email = data.email.toLowerCase();

    if (data.password) {
      userToUpdate.password = await bcrypt.hash(data.password, 12);
      userToUpdate.passwordUpdated = false;
    }

    // ✅ Profile Image Handling (shared)
    if (req.file) {
      if (userToUpdate.profileImage?.public_id) {
        await deleteFromCloudinary(userToUpdate.profileImage.public_id);
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "SAARTHI/profiles",
        public_id: `profile_${userToUpdate._id}`,
        overwrite: true,
      });

      userToUpdate.profileImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // ✅ Additional InstitutionAdmin updates
    if (isMainAdmin && targetRole === "InstitutionAdmin") {
      const institution = await Institution.findById(userToUpdate.institution);
      if (institution) {
        if (data.instituteName) institution.instituteName = data.instituteName;
        if (data.emailDomain) institution.emailDomain = data.emailDomain;
        if (data.collegeCode) institution.collegeCode = data.collegeCode;
        if (data.contactEmail) institution.contactEmail = data.contactEmail;
        await institution.save();
      }
    }

    await userToUpdate.save();

    return res.status(200).json({
      success: true,
      message: `User updated successfully by ${requesterRole}`,
      user: userToUpdate,
    });
  } catch (err) {
    console.error("Update Profile by Admin Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// -------------------- GET ALL USERS (e.g., for Admins) --------------------
export const getAllUsers = async (req, res) => {
  try {
    const { role, search = "", page = 1, limit = 100 } = req.query;
    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "Role query parameter is required." });
    }

    const filter = { role };
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .populate("institution", "instituteName collegeCode")
      .select("-password")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching users." });
  }
};

// -------------------- DELETE ENTITY BY ADMIN --------------------
export const deleteEntityByAdmin = async (req, res) => {
  const { targetId } = req.params;
  const admin = req.user;

  // Use a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const institution = await Institution.findById(targetId).session(session);
    if (institution) {
      if (admin.role !== "MainAdmin") {
        await session.abortTransaction();
        return res
          .status(403)
          .json({
            success: false,
            message: "Only Main Admins can delete institutions.",
          });
      }
      // Cascading delete: remove all users associated with this institution
      await User.deleteMany({ institution: institution._id }).session(session);
      await institution.deleteOne();

      await session.commitTransaction();
      return res
        .status(200)
        .json({
          success: true,
          message: "Institution and all associated users deleted successfully.",
        });
    }

    const user = await User.findById(targetId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Entity not found." });
    }

    let canDelete = false;
    if (admin.role === "MainAdmin") canDelete = true;
    if (
      admin.role === "InstitutionAdmin" &&
      String(user.institution) === String(admin.institution)
    ) {
      if (["Student", "CollegePsychologist"].includes(user.role))
        canDelete = true;
    }

    if (!canDelete) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to delete this user.",
        });
    }

    await user.deleteOne();
    await session.commitTransaction();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete Entity Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during deletion." });
  } finally {
    session.endSession();
  }
};


// -------------------- GET ADMIN OVERVIEW (MainAdmin) --------------------
export const getAdminOverview = async (req, res) => {
  console.log("Fetching admin overview stats...");
  try {
    const [totalInstitutes, totalStudents, totalPsychologists] = await Promise.all([
      Institution.countDocuments(),
      User.countDocuments({ role: "Student" }),
      User.countDocuments({ role: "CollegePsychologist" }),
    ]);
    console.log("Counts:", totalInstitutes, totalStudents, totalPsychologists);

    res.status(200).json({
      success: true,
      data: { totalInstitutes, totalStudents, totalPsychologists },
    });
  } catch (error) {
    console.error("Error fetching overview:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





export const getPsychologistsForStudent = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only students can access this.",
      });
    }

    const psychologists = await User.find({
      role: "CollegePsychologist",
      institution: user.institution,
    }).select("-password");

    res.status(200).json({
      success: true,
      psychologists,
    });
  } catch (error) {
    console.error("Error fetching psychologists:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching psychologists",
    });
  }
};
