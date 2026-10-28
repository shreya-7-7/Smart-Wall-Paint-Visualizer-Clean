/**
 * HTML email templates for Interior Design System
 * Uses the app's brand colors: #8B7355, #A0826D
 */

const getPasswordResetOTPTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Interior Design System</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f2ee; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f2ee;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(62, 39, 35, 0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%); padding: 32px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Interior Design System</h1>
                    <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">Password Reset</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">Hi there,</p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #6B7280;">You requested a password reset. Use the verification code below to continue:</p>
              
              <!-- OTP Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 24px auto 32px;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%); padding: 20px 40px; border-radius: 12px;">
                    <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', Consolas, monospace;">${otp}</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 8px; font-size: 13px; color: #9CA3AF;">⏱️ This code expires in <strong>10 minutes</strong>.</p>
              <p style="margin: 0 0 24px; font-size: 13px; color: #9CA3AF;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
              
              <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.6;">For security, never share this code with anyone. Interior Design System will never ask for it via phone or email.</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #FDFAF7; border-top: 1px solid #F3EFE9;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center;">© Interior Design System · Design your perfect space</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = {
  getPasswordResetOTPTemplate,
};
