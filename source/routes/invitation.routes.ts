import { Router } from "express";
import {
  computeInvites,
} from "../controllers/invitation.controller";
const router: Router = Router();

router.route("/compute-invites").post(computeInvites);

export default router;