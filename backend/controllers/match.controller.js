import Match from '../db/match.model.js';
import { getMatchStatus } from '../utils/matchUtils.js';


const createMatch = async (req, res) => {
    try {
        const { homeTeam, awayTeam, sport, startTime, endTime, homeScore, awayScore } = req.body;

        const status = getMatchStatus(startTime, endTime);

        const match = new Match({
            homeTeam,
            awayTeam,
            sport,
            startTime : new Date(startTime),
            endTime : new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status,
        });

        await match.save();
        if(res.app.locals.broadcastMatchCreated){
            res.app.locals.broadcastMatchCreated(match);
        }

        res.status(201).json({data : match, message: "Match created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export {
    createMatch
}

