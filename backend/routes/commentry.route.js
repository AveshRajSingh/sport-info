import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { createCommentry, getCommentry } from '../controllers/commentry.controller.js';
import { createCommentrySchema } from '../validations/commentry.validation.js';

const router = Router();

router.route("/:matchId")
    .get(getCommentry)
    .post(validate(createCommentrySchema), createCommentry);

export default router;
