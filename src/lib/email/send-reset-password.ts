import transporter from "@/lib/email/transporter";

export async function sendResetPassword(props: {
	user: {name?: string, email: string},
	url: string
}) {
	const { user, url } = props;

	const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@example.com";
	const appName = process.env.APP_NAME || "FullSnack";

	const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2>Reset your ${appName} password</h2>
      <p>Hello ${user.name || user.email},</p>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <p style="margin: 24px 0;">
        <a href="${url}" style="background: #111827; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none; display: inline-block;">Reset Password</a>
      </p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p style="color:#6b7280; font-size: 12px;">This link will expire soon for your security.</p>
    </div>`;

	try {
		if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
			console.warn(
				"SMTP credentials are not set. Falling back to console log for reset link:",
				url,
			);
			return;
		}

		await transporter.sendMail({
			from,
			to: user.email,
			subject: `${appName} • Reset your password`,
			html,
		});
	} catch (e) {
		console.error("Failed to send reset password email:", e);
	}
}
