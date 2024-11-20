import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY } = process.env;
const SHEET_ID = "13Sq_S52noOgbO3MqNjpHHeLG-rGHW9pQwbFq3Mqa_Bs";

const authClient = new google.auth.JWT(
  GOOGLE_SHEETS_CLIENT_EMAIL,
  null,
  GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const fetchData = async () => {
  const token = await authClient.authorize();
  authClient.setCredentials(token);

  const res = await google.sheets("v4").spreadsheets.values.get({
    auth: authClient,
    spreadsheetId: SHEET_ID,
    range: 'Data!A:C',
  });

  return (res.data.values || []).slice(1).map(row => ({
    name: row[0],
    email: row[1],
    status: row[2],
  }));
};

app.get('/api/answers', async (req, res) => {
  try {
    const answers = await fetchData();
    res.json(answers.length ? answers : { message: "No data found." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

const PORT = 5555;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));