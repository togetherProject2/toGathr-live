import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';
import smtpTransport from 'nodemailer-smtp-transport';
import ical from 'ical-generator';
import bodyParser from 'body-parser';
import multer from 'multer';
dotenv.config();

const corsOptions = {
  origin: [`http://localhost:${process.env.REACT_PORT}`],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb", parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
});


const transporter = nodemailer.createTransport(smtpTransport({
  host: `${process.env.SMTP_HOST}`,
  port:  `${process.env.SMTP_PORT}`,
  secure: false,
  auth: {
    user: `${process.env.SMTP_MAIL}`,
    pass: `${process.env.SMTP_PASSWORD}`,
  },
}));


const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//Your Product//EN
METHOD:PUBLISH
BEGIN:VEVENT
UID:1234567890@example.com
DTSTAMP:20231001T120000Z
DTSTART:20231010T130000Z
DTEND:20231010T140000Z
SUMMARY:Meeting Invitation
DESCRIPTION:This is a meeting invitation.
LOCATION:Online
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;


const sendEmail = async (sendto, subject, message, nameOfGuest, attachmentFiles, icsContent) => {
  try {
    if (!Array.isArray(sendto)) {
      sendto = [sendto]; // Wrap in array if it's not an array
    }

    const responses = [];

    for (const email of sendto) {
      console.log('Sending email to:', email);

      const mailOptions = {
        from: `${process.env.SMTP_MAIL}`, 
        to: email,
        subject: subject,
        text: message,
        html: `
        <h1>Hi ${nameOfGuest}</h1>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p>Please respond to this email by clicking one of the links below:</p>
          <p><a href="https://amneesh.github.io/togathr-email-invite/?email=${email}&name=${nameOfGuest}">Open form</a></p>
        `,            
        icalEvent: {
          filename: 'invite.ics',
          method: 'publish',
          content: icsContent,
        },
        attachments: attachmentFiles, // Attachments from the request
      };

      // Send email one by one and wait for each one to finish
      const response = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
            reject(error);
          } else {
            console.log('Email sent:', info.response);
            resolve({
              email: `${email}`,
              status: 'Invited',
            });
          }
        });
      });

      responses.push(response); // Collect responses

      // Delay for 1 second after sending each email
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return responses;

  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
};

// Endpoint to handle email sending
app.post('/email/sendemail', upload.array('files'), async (req, res) => {
  console.log('req.bd', req.body);
  const { email, subject, message, nameOfGuest, guestAllData , icsContent } = req.body;
  // console.log(req.body ,'test');
  // console.log( 'file' , req.files ); 
  console.log(req.body, 'req body');
  // const emailArray = email.split(',').map(email => email.trim());
  // console.log('emails', emailArray.length);

  const parsedGuestAllData = typeof guestAllData === 'string' ? JSON.parse(guestAllData) : guestAllData;

  const emailArray = email ? email.split(',').map(email => email.trim()) : [];
  const guestDetailsArray = Array.isArray(parsedGuestAllData)
    ? parsedGuestAllData.map(guest => ({
      email: guest.email,
      name: `${guest.first_name} ${guest.last_name}` // Combine first and last name
    }))
    : [];
  console.log('Email Array:', emailArray);
  console.log('Guest Email Array:', guestDetailsArray);



  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
  // Use multer's files to create attachment array for Nodemailer
  const attachmentFiles = req.files.map(file => ({
    filename: file.originalname,
    content: file.buffer, // Use buffer for in-memory file
  }));
  console.log(email);

  try {
    const responses = []; // Initialize an array to store responses

    for (var i = 0; i < guestDetailsArray.length; i++) {
      const response = await sendEmail(guestDetailsArray[i].email, subject, message, guestDetailsArray[i].name, attachmentFiles, icsContent);
      responses.push(response); // Store each response
    }

    // Send a single response after the loop
    res.send({ message: 'Emails sent successfully', responses });
  } catch (error) {
    console.error('Error sending email:', error); // Log the error for debugging
    res.status(500).send({ message: 'Error sending email', error });
  }
});

app.listen(9999, () => {
  console.log('Server listening on pport 3333');
});






