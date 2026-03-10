import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    homeTeam: {
        type: String,
        required: true
    },
    awayTeam: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed'],
        default: 'scheduled'
    },
    homeScore: {
        type: Number,
        default: 0
    },
    awayScore: {
        type: Number,
        default: 0
    }

}, { timestamps: true });


const Match = mongoose.model("Match", matchSchema);


export default Match;