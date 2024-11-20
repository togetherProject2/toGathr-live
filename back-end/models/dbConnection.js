import mongoose from 'mongoose';
mongoose.connect(process.env.MONGO_URI).then(
    () => {
        console.log('Connectd to MongoDB success');
    }
).catch(
    (err) => {
        console.log(err);
    }
)