import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Route to handle contact form submissions
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Configure nodemailer transporter
    // For this to work in production, you must set these environment variables!
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'sukriyashrestha34@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_app_password_here', 
      },
    });

    const mailOptions = {
      from: email,
      to: 'sukriyashrestha34@gmail.com', // The destination email
      subject: `Platformx Contact Form: ${subject}`,
      text: `You have received a new message from the contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    // Even if it fails, we shouldn't necessarily crash the server, just let the user know
    res.status(500).json({ error: 'Failed to send email. Ensure EMAIL_USER and EMAIL_PASS are set in .env' });
  }
});

export default router;
