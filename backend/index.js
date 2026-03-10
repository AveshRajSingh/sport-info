import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res) => {
    res.send("hello form the backend")
})
const startServer = async () => {
    try {
        await connectDB(); // connect to the database 

        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

startServer();