import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config({ path: "./env" });

// Connect to the MongoDB database
mongoose.connect(process.env.DB_CONNECT, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
  .then(() => {
    console.log('Connected successfully to MongoDB');
    
    // Set mongoose options after connecting
    mongoose.set("strictQuery", false);

    // Define the "transcripts" model
    mongoose.model('transcripts', new mongoose.Schema({
      Channel: String,
      Content: Array
    }));
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });





 














