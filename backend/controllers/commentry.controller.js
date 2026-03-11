import Commentry from '../db/commentry.model.js';

const createCommentry = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { actor, message, minute, sequenceNo, data, period, eventType, tags } = req.body;

        const newCommentry = await Commentry.create({
            matchId,
            actor,
            message,
            minute,
            sequenceNo,
            data,
            period,
            eventType,
            tags
        });

        // Broadcast to subscribed clients
        if (req.app.locals.broadcastCommentary) {
            req.app.locals.broadcastCommentary(matchId, newCommentry);
        }

        res.status(201).json({ message: "Commentary created successfully", data: newCommentry });

    } catch (error) {
        console.error("Error creating commentary:", error);
        res.status(500).json({ error: "Failed to create commentary" });
    }
};

const getCommentry = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { limit = 20, page = 1 } = req.query;

        const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100
        const pageNum = parseInt(page) || 1;
        const skip = (pageNum - 1) * limitNum;

        const [commentries, total] = await Promise.all([
            Commentry.find({ matchId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Commentry.countDocuments({ matchId })
        ]);

        res.status(200).json({
            data: commentries,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error("Error fetching commentary:", error);
        res.status(500).json({ error: "Failed to fetch commentary" });
    }
};

export {
    createCommentry,
    getCommentry
}