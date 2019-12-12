import chatModel from "../models/chatModel";
import driverModel from "../models/driverModel";
import { handleError } from "../helpers";
import sendPushNotifications from "./notificationsController";
import subscriptionModel from "../models/subscriptionModel";

const webpush = require("web-push");

const vapidKeys = {
  privateKey: "bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU",
  publicKey:
    "BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8",
};

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);
export default {
  create: (req, res) => {
    console.log(req.body.message.aSub);
    chatModel.findOne({ driverPhone: req.body.phone }, (err, messages) => {
      if (err) {
        return {
          message: "Error when getting code.",
          error: err,
          status: "error",
        };
      }
      if (!messages) {
        var message = {
          text: req.body.message.text,
          timestamp: req.body.message.timestamp,
          type: req.body.message.type,
        };
        const chat = new chatModel({
          driverPhone: req.body.phone,
          lastTime: Date.now().toString(),
          messages: [message],
        });
        chat.save((err, chat) => {
          const handle = handleError(err, chat, "chat", res);
          if (handle) {
            return res.status(handle.statusCode).json(handle.body);
          }
          return res.status(201).json({ status: "success" });
        });
      } else {
        var message = {
          text: req.body.message.text,
          timestamp: req.body.message.timestamp,
          type: req.body.message.type,
        };
        chatModel.updateOne(
          { driverPhone: req.body.phone },
          { $push: { messages: message } },
          (error, success) => {
            if (error) {
              console.log(error);
            } else {
              console.log(success);
            }
          },
        );
        chatModel.updateOne(
          { driverPhone: req.body.phone },
          {
            $set: {
              lastTime: Date.now().toString(),
            },
          },
          (error, success) => {
            if (error) {
              console.log(error);
            } else {
              console.log(success);
            }
          },
        );
        if (req.body.message.type === "admin") {
          driverModel.findOne(
            { phone: req.body.phone.substr(1) },
            (err, driver) => {
              if (err) {
              } else {
                sendPushNotifications(driver.pushTokens, {
                  title: "Новое сообщениие",
                  body: req.body.message.text,
                });
              }
            },
          );
        }
        if (req.body.message.type === "driver") {
          subscriptionModel.find({}, (error, chats) => {
            if (error) {
              console.log(error);
            } else {
              for (const i in chats) {
                console.log(chats);
                const pushSubscription = chats[i].aSub;
                webpush
                  .sendNotification(
                    pushSubscription,
                    JSON.stringify({
                      title: "Новое сообщение",
                      text: req.body.phone,
                      image: "/images/jason-leung-HM6TMmevbZQ-unsplash.jpg",
                      tag: "new-message",
                      url: "/new-product-jason-leung-HM6TMmevbZQ-unsplash.html",
                    }),
                  )
                  .catch((err) => {
                    console.log(err);
                  });
              }
            }
          });
        }
      }
    });
    res.send.status(201);
  },
  getMessages: (req, res) => {
    chatModel.findOne({ driverPhone: req.body.phone }, (err, messages) => {
      if (err) {
        console.log(err);
        res.send([]);
      }
      if (messages) {
        res.send(messages.messages);
      } else {
        res.send([]);
      }
    });
  },
  getChats: (req, res) => {
    chatModel.find({}, (err, chats) => {
      if (err) {
        console.log(err);
        res.send([]);
      } else {
        res.send(chats);
      }
    });
  },
};
