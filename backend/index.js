import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

import matchRoutes from './routes/match.route.js';
import commentryRoutes from './routes/commentry.route.js';

// from this middleware we can use json 
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res) => {
    res.json({body:req.body, query :req.query, params : req.params, headers : req.headers});
});

const startServer = async () => {
    try {
        await connectDB(); // connect to the database 
        
        app.use('/api/matches', matchRoutes);
        app.use('/api/commentry', commentryRoutes);
        
        const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(server);
        app.locals.broadcastMatchCreated = broadcastMatchCreated;
        app.locals.broadcastCommentary = broadcastCommentary;

        const PORT = process.env.PORT || 8000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

startServer();