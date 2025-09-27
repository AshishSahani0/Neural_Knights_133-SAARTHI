import { generateVerificationOtpEmailTemplate } from "./emailTemplate.js";
import sendEmail from "./sendEmail.js";

export async function sendVerificationCode(verificationCode, email) {
  try {
    const html = generateVerificationOtpEmailTemplate(verificationCode);

    await sendEmail({
      to: email,
      subject: "Your SAARTHI Verification Code",
      html,
    });
  } catch (error) {
    console.error("❌ OTP Email Sending Error:", error.message);
    // Re-throw the error so the controller can handle it
    throw error;
  }
}