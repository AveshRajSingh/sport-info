import mongoose from "mongoose";


const connectDB = async () => {
    try {
         const connection = await mongoose.connect(process.env.MONGO_URI);
         console.log(`MongoDB connected: ${connection.connection.host}`);
        
    } catch (error) {
        console.error(error.message);
        throw error.message;

    }
}

export default connectDB;