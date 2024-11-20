import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/authRouter.js';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';


const app = express();
dotenv.config();

const GPORT = process.env.GOOGLE_PORT || 8080;
// const LPORT = process.env.LOCAL_PORT || 5173;

app.use(cors({
    origin: `http://localhost:${process.env.REACT_PORT}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, 
}));
app.use(express.json({ limit: '50mb' }));


app.use('/', router)


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
    console.log('email', email, subject, message)
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
    const { email, subject, message } = req.body.dataToSend;
    console.log('req in eail', req.body)

    try {
        const response = await sendEmail(email, subject, message);
        res.status(200).json({ message: 'Email sent successfully', response });
    } catch (error) {
        res.status(500).send({ message: 'Error sending email', error });
    }
});
  
app.listen(GPORT, () => {
    console.log(`Server for google starts at ${GPORT}`);
});