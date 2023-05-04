import { Router } from "express";
import InvitesController from "../controllers/invitation.controller";


const router: Router = Router();
const rabbitMQURL: string = "amqp://username:password@192.168.33.17:5672";
const eventQueue: string = "customerInvites";
const invitationController = new InvitesController(rabbitMQURL, eventQueue);
router.route("/compute-invites").post(invitationController.computeInvites);

export default router;