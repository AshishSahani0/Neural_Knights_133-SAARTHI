import User from "../models/userSchema.js";
import sendEmail from "../util/sendEmail.js";
import Institution from "../models/institutionSchema.js";

// -------------------- SEND EMERGENCY ALERT --------------------
export const sendEmergencyAlert = async (req, res) => {
  try {
    const student = req.user;
    const { message } = req.body;

    if (!student || !student.institution) {
      return res.status(400).json({ success: false, message: "Student or institution not found." });
    }

    // Find the Institution Admin and all College Psychologists for this institution
    const recipients = await User.find({
      $or: [
        { role: "InstitutionAdmin", institution: student.institution },
        { role: "CollegePsychologist", institution: student.institution },
      ],
      isActive: true,
    }).select("email");

    const recipientEmails = recipients.map(r => r.email);

    if (recipientEmails.length === 0) {
      console.warn("No active counselors or admin found for institution:", student.institution);
      return res.status(404).json({ success: false, message: "No counselors or admin found for your institution." });
    }

    const subject = `CRISIS ALERT: Student in Distress - ${student.username}`;
    const emailBody = `
      <p><strong>This is an urgent mental health alert.</strong></p>
      <p>A student has reached out for immediate help. Please contact them immediately.</p>
      <hr>
      <p><strong>Student Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${student.username}</li>
        <li><strong>Email:</strong> ${student.email}</li>
        <li><strong>Time of Alert:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      ${message ? `<p><strong>Student's Message:</strong></p><p>${message}</p>` : ''}
      <hr>
      <p>Please respond to this alert with the highest priority.</p>
    `;

    await sendEmail({
      to: recipientEmails,
      subject,
      html: emailBody,
    });

    res.status(200).json({
      success: true,
      message: "Emergency alert sent successfully to counselors and admin.",
    });
  } catch (error) {
    console.error("Error sending emergency alert:", error);
    res.status(500).json({ success: false, message: "Server error. Could not send alert." });
  }
};