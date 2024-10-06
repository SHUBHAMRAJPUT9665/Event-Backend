import { Router } from "express";
import { createEvent, getEventDetails } from "../controllers/event.controller.js";
import { cancelParticipation, joinEvent } from "../controllers/user.controller.js";
import { authorizedRoles, isLoggedIn } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/create-event").post(isLoggedIn,authorizedRoles("ADMIN"),createEvent);
router.route('/participants/:eventId').get(getEventDetails);
router.route("/join/:eventId").post(isLoggedIn,joinEvent)
router.route("/cancel-participant/:eventId").post(isLoggedIn,cancelParticipation)



export default router;








