import {z} from 'zod';

export const createCommentrySchema = z.object({
    actor: z.string().min(1, "Actor is required"),
    message: z.string().min(1, "Message is required"),
    minute: z.number().int().min(0).default(0),
    sequenceNo: z.number().int().min(0),
    data: z.record(z.string(), z.any()).default({}),
    period: z.string().default("First Half"),
    eventType: z.string().min(1, "Event type is required"),
    tags: z.array(z.string()).default([])
});

export const updateCommentrySchema = z.object({
    actor: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
    minute: z.number().int().min(0).optional(),
    sequenceNo: z.number().int().min(0).optional(),
    data: z.record(z.string(), z.any()).optional(),
    period: z.string().optional(),
    eventType: z.string().min(1).optional(),
    tags: z.array(z.string()).optional()
});

export const listCommentrySchema = z.array(createCommentrySchema);
