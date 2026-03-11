import Match from '../db/match.model.js';
import { getMatchStatus } from '../utils/matchUtils.js';


const createMatch = async (req, res) => {
    try {
        const { homeTeam, awayTeam, sport, startTime, endTime,homeScore,awayScore} = req.body;

        if (!homeTeam || !awayTeam || !sport || !startTime || !endTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (homeTeam === awayTeam) {
            return res.status(400).json({ message: "Teams cannot be the same" });
        }

        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        const status = getMatchStatus(startTime, endTime);

        const ending = new Date(endTime);
        const starting = new Date(startTime);

        const match = new Match({
            homeTeam,
            awayTeam,
            sport,
            startTime : starting,
            endTime : ending,
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status,
        });

        await match.save();

        res.status(201).json({data : match, message: "Match created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export {
    createMatch
}

