import { Router } from "express";
import {
  computeInvites,
} from "../controllers/invitation.controller";
const router: Router = Router();

router.route("/compute-invites").post(computeInvites);
// router.route("/v1/todo/:id").get(singleTodoItem);
// router.route("/v1/todo/add").post(addTodoItem);
// // using put as that is the proper HTTP method. We can replace this with a post and make a few tweaks in the controller.
// router.route("/v1/todo/update").put(updateTodoItem);
// router.route("/v1/todo/delete/:id").delete(removeTodoItem);

export default router;