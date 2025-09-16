import nodemailer from "nodemailer";

// Centralized Nodemailer transporter (Gmail SMTP by default)
// Reads configuration from environment variables:
// - SMTP_HOST (default: smtp.gmail.com)
// - SMTP_PORT (default: 587)
// - SMTP_USER
// - SMTP_PASS
// - SMTP_SECURE (optional: "true" to force secure)
export const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: Number(process.env.SMTP_PORT || 587),
	secure:
		(process.env.SMTP_SECURE ?? "") === "true" || String(process.env.SMTP_PORT || "587") === "465",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export default transporter;
