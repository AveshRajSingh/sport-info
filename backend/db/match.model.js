const matchSchema = new mongoose.Schema({
    homeTeam: {
        type: String,
        required: true,
        trim: true
    },
    awayTeam: {
        type: String,
        required: true,
        trim: true
    },
    sport: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        index: true
    },
    endTime: {
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
        default: 0,
        min: 0
    },
    awayScore: {
        type: Number,
        default: 0,
        min: 0
    }

}, { timestamps: true });