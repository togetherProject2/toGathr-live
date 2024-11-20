import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';
import smtpTransport from 'nodemailer-smtp-transport';

dotenv.config();

const corsOptions = {
  origin: [`http://localhost:${process.env.REACT_PORT}`],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

const transporter = nodemailer.createTransport(smtpTransport({
  host: `${process.env.SMTP_HOST}`,
  port:  `${process.env.SMTP_PORT}`,
  secure: false,
  auth: {
    user: `${process.env.SMTP_MAIL}`,
    pass: `${process.env.SMTP_PASSWORD}`,
  },
}));

const sendEmail = async (email, subject, message) => {
  try {
    const mailOptions = {
      from: `${process.env.SMTP_MAIL}`,
      to: email,
      subject: subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { status: 'Success', response: info.response };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Endpoint to handle email sending
app.post('/send-email-invite', async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    const response = await sendEmail(email, subject, message);
    res.status(200).json({ message: 'Email sent successfully', response });
  } catch (error) {
    res.status(500).send({ message: 'Error sending email', error });
  }
});

app.listen(7000, () => {
  console.log('Server listening on port 9999');
});
