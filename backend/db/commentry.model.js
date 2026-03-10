import mongoose from "mongoose";

const commentrySchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },
    actor : {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    minute: {
        type: Number,
        default: 0
    },
    sequenceNo:{
        type: Number,
        required: true
    },
    data:{
        type: Object,
        default: {}
    },
    period:{
        type: String,
        default: "First Half"
    },
    eventType:{
        type: String,
        required: true
    },
    tags :{
        type: [String],
        default: []
    }


}, { timestamps: true });


const Commentry = mongoose.model("Commentry", commentrySchema); 

export default Commentry;
    