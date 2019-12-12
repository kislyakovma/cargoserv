import express from "express";
import codeController from "./controllers/codeController";
import driverController from "./controllers/driverController";
import chatControlller from "./controllers/chatController";
import subscriptionHandler from "./controllers/subscriptionHandler";

const router = express.Router();
router.post("/code", codeController.create);
router.post("/user", driverController.create);
router.post("/chat", chatControlller.create);
router.post("/messages", chatControlller.getMessages);
router.get("/chats", chatControlller.getChats);
router.post(
  "/subscription",
  subscriptionHandler.handlePushNotificationSubscription,
);
router.post("/subcscribe", subscriptionHandler.subscribe);
router.get("/subscription/:id", subscriptionHandler.sendPushNotification);
export default router;
