import { z } from "zod";

export const createMatchSchema = z.object({
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    sport: z.string().min(1, "Sport is required"),

    startTime: z.coerce.date(),
    endTime: z.coerce.date(),

    status: z.enum(['scheduled', 'live', 'completed']).optional().default('scheduled'),

    homeScore: z.coerce.number().min(0).optional().default(0),
    awayScore: z.coerce.number().min(0).optional().default(0)

}).refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"]
});
