import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import budgetRouter from './routes/budgetList.js'
import router from './routes/events.js';
import mongoose from 'mongoose';
import axios from 'axios';
import multer from "multer";
import UserModel from './models/userModels.js';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import VendorModel from './models/vendorModel.js';
// import { SESClient } from "@aws-sdk/client-ses";
// import { fromIni } from "@aws-sdk/credential-providers";


dotenv.config();
// const corsOptions = {
//   origin: [`http://localhost:${process.env.REACT_PORT}`],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
// }

const app = express();
app.use(cors());
// app.options('*', cors(corsOptions)); // Handle pre-flight requests
app.use(express.json());


const url = process.env.MONGO_URI;
const dbName = 'toGather';
const collectionName = 'guest_management';

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
  socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(url);
    console.log('Connected to MongoDB');
    return client;
  } catch (err) {
    console.log(err);
  }
}

// Create a collection
function createCollection(client, collectionName) {
  return client.db(dbName).collection(collectionName);
}
const s3Client = new S3Client({

  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

});
// CRUD functions
console.log(process.env.AWS_BUCKET_NAME, process.env.AWS_SECRET_ACCESS_KEY)
app.get('/images', async (req, res) => {

  console.log(S3Client);
  try {
    const command = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
    });
    const data = await s3Client.send(command);

    const images = data.Contents.map(item => item.Key);
    res.json(images);
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).send("Error fetching images");
  }
});


const upload = multer({ storage: multer.memoryStorage() });

async function findExistingKey(email) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_BUCKET_NAME,
  });

  const response = await s3Client.send(command);
  const existingKey = response.Contents.find(item => item.Key.includes(email + '_profilePicture'));

  return existingKey ? existingKey.Key : null; // Return the existing key or null
}
async function deleteOldImage(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

app.post('/uploadDP', upload.single('image'), async (req, res) => {
  const {emailWhole, email, portalType } = req.body;

  console.log(email);

  try {
    const existingKey = await findExistingKey(emailWhole);

    const { originalname, buffer } = req.file;
    const now = new Date();



    if (existingKey) {
      await deleteOldImage(existingKey);

      console.log(`User  with email ${emailWhole} already has a profile picture. Updating...`);
      // Generate a new key with the current timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const newKey = `${emailWhole}_profilePicture_${timestamp}`;

      // Upload the new image
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: newKey,
        Body: buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(command);

      // Create the new image URL
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
      const mongoRes = await updateUserData(imageUrl, email);
      res.status(200).send({ message: 'Image uploaded successfully', imageURL: imageUrl, mongoResponse: mongoRes });


    } else {
      console.log(`No existing user found. Creating new entry...`);
      // Generate a new key with the current timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const newKey = `${emailWhole}_profilePicture_${timestamp}`;

      // Upload the new image
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: newKey,
        Body: buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(command);

      // Create the new image URL
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;

      if (portalType == 'eventGuest') {
        const mongoRes = await updateUserData(imageUrl, email);
        res.status(200).send({ message: 'Image uploaded successfully', imageURL: imageUrl, mongoResponse: mongoRes });
      } if (portalType == 'vendor') {
        const mongoRes = await updateVendorData(imageUrl, email);
        res.status(200).send({ message: 'Image uploaded successfully', imageURL: imageUrl, mongoResponse: mongoRes });
      }


    }

    //res.status(200).send({ message: 'Image uploaded successfully', imageURL: imageUrl });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).send("Error uploading image");
  }
});

app.delete('/deleteDP', async (req, res) => {
  const {emailWhole, email, portalType } = req.body;

  console.log(portalType, 'hjcsjhbdscbsbcbsdhbcjsbcjsdhj cd');
  if (!emailWhole) {
    return res.status(400).send("Email is required");
  }

  const key = `${emailWhole}_profilePicture`; // Unique filename

  try {
    // Create the command to delete the object
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    // Send the command to delete the object
    await s3Client.send(command);
    console.log(`File ${key} deleted successfully.`);

    const imageUrl = 'https://togather-aws-image.s3.us-east-1.amazonaws.com/anonymous-image.png';
    // Optionally, you can also update your database to remove the image URL or set it to null
    if (portalType == 'eventGuest') {
      const mongoRes = await updateUserData(imageUrl, email); // Assuming this sets the profile picture URL to null
      // console.log(mongoRes);
      res.status(200).send({ message: 'Image deleted successfully', mongoResponse: mongoRes });
    }
    if (portalType == 'vendor') {
      const mongoRes = await updateVendorData(imageUrl, email); // Assuming this sets the profile picture URL to null
      // console.log(mongoRes, '----------------------');
      res.status(200).send({ message: 'Image deleted successfully', mongoResponse: mongoRes });
    }


  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).send("Error deleting image");
  }
});


const updateUserData = async (imageUrl, email) => {

  let isDataUpdated = false;
  try {
    let user = await UserModel.findOne({ email: email });

    if (user) {
      // console.log(user);
      const updatedUser = await UserModel.updateOne(
        { _id: user._id }, // Use the user's ID to find the correct document
        {
          $set: {

            image: imageUrl,

          }
        }
      );
      if (updatedUser.nModified === 0) {
        isDataUpdated = false;
      } else {
        isDataUpdated = true;
      }
      // return { status: 200, message: 'User updated successfully.', updatedUser };
    } else {
      // return { status: 500, message: 'Internal Server Error' };
      isDataUpdated = false;
    }
  } catch (err) {
    // console.log(err, 'error');
    // return { status: 500, message: 'Error updating user data' };
    isDataUpdated = false;
  }
  return isDataUpdated;
};

const updateVendorData = async (imageUrl, email) => {

  let isDataUpdated = false;
  console.log(email,'**********8*********88');
  try {
    let vendor = await VendorModel.findOne({ email: email });
    if (vendor) {
      const updatedVendor = await VendorModel.updateOne(
        { _id: vendor._id }, // Use the user's ID to find the correct document
        {
          $set: {
            image: imageUrl,
          }
        }
      );
      if (updatedVendor.nModified === 0) {
        isDataUpdated = false;
      } else {
        isDataUpdated = true;
      }
      // return { status: 200, message: 'User updated successfully.', updatedUser };
    } else {
      // return { status: 500, message: 'Internal Server Error' };
      isDataUpdated = false;
    }
  } catch (err) {
    // return { status: 500, message: 'Error updating user data' };
    isDataUpdated = false;
  }
  return isDataUpdated;
};


app.post('/create-data/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  const data = req.body;
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      const result = await collection.insertOne(data);
      console.log('Data created successfully');
      res.send({ _id: result.insertedId, data: result });
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error creating data' });
    } finally {
      client.close();
    }
  }
});

app.put('/budget-item/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  const data = req.body;
  const { _id, ...updatedEvent } = data;  // Destructure to remove _id from the update object
  if (!_id) {
    return res.status(400).send({ message: 'Missing _id for the update' });
  }
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      console.log('ID of the event: ============', _id);
      const result = await collection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updatedEvent }
      );
      console.log('Data created successfully');
      res.send(updatedEvent);
      // res.send({ _id: result.insertedId, data: result });
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error creating data' });
    } finally {
      client.close();
    }
  }
});

// mongo connection start

app.use('/api/budget', budgetRouter);


// Handle GET request to get data with query params
app.get('/read-data/:collectionName/:queryParam', async (req, res) => {
  const { collectionName, queryParam } = req.params;

  // parse the query parameters
  const query = new URLSearchParams(queryParam);
  const queryObject = Object.fromEntries(query.entries());

  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {

      const result = await collection.find(queryObject).toArray();
      console.log('Data read successfully ....');
      res.send(result);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'Error reading data' });
    } finally {
      client.close();
    }
  } else {
    res.status(500).send({ message: 'Error connecting to the database' });
  }
});

app.get('/read-collaborator-events/:collectionName/:email', async (req, res) => {
  const { collectionName, email } = req.params;

  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      // Query to find events where the email is in the collaborators array
      const queryObject = { collaborators: { $in: [email] } };

      const result = await collection.find(queryObject).toArray();
      console.log('Collaborator events fetched successfully ....');
      res.send(result);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'Error reading collaborator events' });
    } finally {
      client.close();
    }
  } else {
    res.status(500).send({ message: 'Error connecting to the database' });
  }
});



// Handle GET request to read Overview Data
app.get('/overview/:id', async (req, res) => {
  const { id } = req.params;
  const eventId = new ObjectId(id);
  const client = await connectToMongoDB();
  if (client) {
    const eventCollection = createCollection(client, 'events');
    const budgetItemsCollection = createCollection(client, 'budget_items');

    try {
      const event = await eventCollection.findOne({ _id: eventId });
      const budgetItems = await budgetItemsCollection.find({ eventId: id }).toArray();

      const responseData = {
        event_data: event,
        budget_items: budgetItems
      };
      console.log('Overview data read successfully');
      res.send(responseData);
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error reading overview data' });
    } finally {
      client.close();
    }
  }
});

// Handle GET request to read Reviews
app.get('/readReviews/:collectionName/:placeId', async (req, res) => {
  const { collectionName, placeId } = req.params;
  console.log('reviews params', req.params)
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      const result = await collection.find({ place_id: placeId }).toArray();
      console.log('Data read successfully');
      res.send(result);
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error reading data' });
    } finally {
      client.close();
    }
  }
});

// Handle GET request to read data
app.get('/readData/:collectionName/:email/:eventID', async (req, res) => {
  const { collectionName, email, eventID } = req.params;
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      const result = await collection.find({ email: email, eventID: eventID }).toArray();
      console.log('Data read successfully');
      res.send(result);
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error reading data' });
    } finally {
      client.close();
    }
  }
});

app.get('/readSingleData/:collectionName/:docID', async (req, res) => {
  const { collectionName, docID } = req.params;
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      const result = await collection.find({ _id: new ObjectId(docID) }).toArray();
      console.log('Data read successfully');
      res.send(result);
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error reading data' });
    } finally {
      client.close();
    }
  }
});
app.get('/readVendorData/:collectionName/:email', async (req, res) => {
  const { collectionName, email } = req.params;
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      const result = await collection.find({ user_email: email }).toArray();
      console.log('Data read successfully');
      res.send(result);
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error reading data' });
    } finally {
      client.close();
    }
  }
});

// Handle PUT request to update data
app.put('/update-data/:collectionName/:id', async (req, res) => {
  const { collectionName, id } = req.params;
  const data = req.body;
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
      console.log('Data updated successfully');
      res.send(result);
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error updating data' });
    } finally {
      client.close();
    }
  }
});

// Update multiple data
// app.put('/update-multiple-data/:collectionName', async (req, res) => {
//   const { collectionName } = req.params;
//   const { ids, data } = req.body;

//   try {
//     const collection = db.collection(collectionName);

//     // Prepare bulk write operations
//     const bulkOps = ids.map(id => ({
//       updateOne: {
//         filter: { _id: id },
//         update: { $set: data }
//       }
//     }));

//     // Perform the bulk write operation
//     const result = await collection.bulkWrite(bulkOps);

//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Error in bulk update:', error);
//     res.status(500).send('Error updating data');
//   }
// });



// Handle DELETE request to delete data
app.delete('/delete-data/:collectionName/:id', async (req, res) => {
  const { collectionName, id } = req.params;
  const client = await connectToMongoDB();
  if (client) {
    const collection = createCollection(client, collectionName);
    try {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      console.log('Data deleted successfully');
      res.send({ message: 'Data deleted successfully' });
    } catch (err) {
      console.log(err);
      res.send({ message: 'Error deleting data' });
    } finally {
      client.close();
    }
  }
});

// Start the server
app.listen('3031', () => {
  console.log(`Server is running on port 3031`);
});
// Function to send a request to OpenAI
async function generateTaskList() {
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await axios.post(
      endpoint,
      {
        model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
        messages: [
          { role: 'system', content: 'You are a helpful assistant who creates event task lists.' },
          { role: 'user', content: 'Create a task list for wedding planning' },
        ],
        max_tokens: 150, // Adjust as needed for response length
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const taskList = response.data.choices[0].message.content;
    console.log('Generated Task List:', taskList);
    return taskList;

  } catch (error) {
    console.error('Error with OpenAI API request:', error);
  }
}

//generateTaskList();


// Proxy route to handle requests to Google Places API
app.get('/api/places/:location/:type', async (req, res) => {
  // const { location, type } = req.query;
  const loc = req.params.location;
  console.log(loc);
  const loc_type = req.params.type;
  const radius = req.query.radius;
  const apiKey = process.env.GOOGLE_PLACES_KEY; // Replace with your Google API key
  const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc}&radius=${radius}&type=${loc_type}&key=${apiKey}`;

  try {
    const response = await axios.get(googlePlacesUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching places from Google Places API');
  }
});




