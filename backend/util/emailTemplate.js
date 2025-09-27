// This file seems okay, but let's ensure the template is consistent.
// I've cleaned up the welcome email template text for clarity.

export function generateVerificationOtpEmailTemplate(OTP) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>SAARTHI Support - Verify Your Email</title>
    <style>
      body { font-family: 'Arial', sans-serif; background: #f0f7ff; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; }
      h1 { color: #0b3d91; font-size: 24px; }
      .otp-box { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0b3d91; background-color: #dcefff; padding: 14px 28px; border-radius: 12px; display: inline-block; margin: 20px 0; }
      p { color: #1a1a1a; line-height: 1.6; font-size: 16px; }
      .footer { font-size: 12px; color: #657786; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Verify Your Email</h1>
      <p>Welcome to <strong>SAARTHI Support</strong>. To complete your registration, please use the following One-Time Password (OTP):</p>
      <div class="otp-box">${OTP}</div>
      <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
      <div class="footer">&copy; ${new Date().getFullYear()} SAARTHI Support. All rights reserved.</div>
    </div>
  </body>
</html>`;
}

export function generateForgotPasswordEmailTemplate(resetUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password - SAARTHI</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; background-color: #f0f7ff; padding: 20px; }
    .container { max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
    h1 { color: #0b3d91; }
    .reset-button { display: inline-block; background-color: #0b3d91; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; margin: 20px 0; }
    .footer { font-size: 14px; margin-top: 20px; color: #657786; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>
    <p>We received a request to reset the password for your <strong>SAARTHI Support</strong> account.</p>
    <p>Click the button below to set a new password. This link is valid for 15 minutes.</p>
    <a href="${resetUrl}" class="reset-button">Reset Password</a>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
    <div class="footer"><b>SAARTHI Support Team</b></div>
  </div>
</body>
</html>`;
}

export function generateVerificationSuccessEmailTemplate(username) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account Verified - SAARTHI</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f0f7ff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); text-align: center; }
    h1 { color: #0b3d91; }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Account Verified!</h1>
    <p>Hello <strong>${username}</strong>,</p>
    <p>Your account with SAARTHI has been successfully verified. You can now log in to access your dashboard.</p>
    <p>Thank you for joining our community!</p>
  </div>
</body>
</html>`;
}

export function generateWelcomeEmailTemplate({ name, email, password }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to SAARTHI</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 500px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 0 12px rgba(0, 0, 0, 0.08); }
    h1 { color: #0b3d91; }
    .info-box { background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: left; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to SAARTHI!</h1>
    <p>Hello <strong>${name}</strong>,</p>
    <p>An account has been successfully created for you. Here are your login credentials:</p>
    <div class="info-box">
      <p><strong>Login Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
    </div>
    <p>For your security, please log in and <strong>update your password</strong> as soon as possible.</p>
    <div class="footer">Welcome aboard! <br /><strong>SAARTHI Team</strong></div>
  </div>
</body>
</html>`;
}