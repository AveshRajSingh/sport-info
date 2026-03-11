import {Router} from 'express';
import {validate } from '../middlewares/validate.middleware.js';
import { createMatch,getMatches } from '../controllers/match.controller.js';
import { createMatchSchema } from '../validations/matches.validation.js';

const router = Router();


router.route("/").get(getMatches);

router.route("/create-match").post(validate(createMatchSchema), createMatch);




export default router;