import Expo from "expo-server-sdk";
import driverModel from "../models/driverModel";
import { handleError, handleAll } from "../helpers";

module.exports = {
  /**
   * productController.list()
   */
  target: (req, res) => {
    const { id } = req.params;
    driverModel.findOne({ _id: id }, (err, user) => {
      const handle = handleAll(err, user, "user", res);
      if (handle) {
        return res.status(handle.statusCode).json(handle.body);
      }
      sendPushNotifications(user.pushTokens, {
        title: req.body.title,
        body: req.body.body,
      });
      return res.json({ status: "success", user });
    });
  },
  place: (req, res) => {
    const { place } = req.body;
    driverModel.find({ place }, (err, users) => {
      const handle = handleError(err, users, "users", res);
      if (handle) {
        return res.status(handle.statusCode).json(handle.body);
      }
      let tokens = [];
      users.forEach((user) => {
        tokens = tokens.concat(user.pushTokens);
      });
      sendPushNotifications(tokens, {
        title: req.body.title,
        body: req.body.body,
      });
      return res.json({ status: "success", users });
    });
  },
  placeBarista: (req, res) => {
    const { place } = req.body;
    driverModel.find({ place, type: "barista" }, (err, users) => {
      const handle = handleError(err, users, "users", res);
      if (handle) {
        return res.status(handle.statusCode).json(handle.body);
      }
      let tokens = [];
      users.forEach((user) => {
        tokens = tokens.concat(user.pushTokens);
      });
      sendPushNotifications(tokens, {
        title: req.body.title,
        body: req.body.body,
      });
      return res.json({ status: "success", users });
    });
  },
  all: (req, res) => {
    driverModel.find((err, users) => {
      const handle = handleError(err, users, "users", res);
      if (handle) {
        return res.status(handle.statusCode).json(handle.body);
      }
      let tokens = [];
      users.forEach((user) => {
        tokens = tokens.concat(user.pushTokens);
      });
      sendPushNotifications(tokens, {
        title: req.body.title,
        body: req.body.body,
      });
      return res.json({ status: "success", users });
    });
  },
  barista: (req, res) => {
    driverModel.find({ type: "barista" }, (err, users) => {
      const handle = handleError(err, users, "users", res);
      if (handle) {
        return res.status(handle.statusCode).json(handle.body);
      }
      let tokens = [];
      users.forEach((user) => {
        tokens = tokens.concat(user.pushTokens);
      });
      sendPushNotifications(tokens, {
        title: req.body.title,
        body: req.body.body,
      });
      return res.json({ status: "success", users });
    });
  },
};
let sendPushNotifications;
export default sendPushNotifications = (pushTokens, message) => {
  // Create a new Expo SDK client
  const expo = new Expo();

  // Create the messages that you want to send to clents
  const messages = [];
  for (const pushToken of pushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    messages.push({
      to: pushToken,
      title: message.title,
      sound: "default",
      priority: "high",
      body: message.body,
      data: { withSome: "data" },
      android: {
        priority: "max",
        vibrate: [0, 250, 250, 250],
        color: "#FF0000",
      },
    });
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
      } catch (error) {
        console.error(error);
      }
    }
  })();

  // Later, after the Expo push notification service has delivered the
  // notifications to Apple or Google (usually quickly, but allow the the service
  // up to 30 minutes when under load), a "receipt" for each notification is
  // created. The receipts will be available for at least a day; stale receipts
  // are deleted.
  //
  // The ID of each receipt is sent back in the response "ticket" for each
  // notification. In summary, sending a notification produces a ticket, which
  // contains a receipt ID you later use to get the receipt.
  //
  // The receipts may contain error codes to which you must respond. In
  // particular, Apple or Google may block apps that continue to send
  // notifications to devices that have blocked notifications or have uninstalled
  // your app. Expo does not control this policy and sends back the feedback from
  // Apple and Google so you can handle it appropriately.
  const receiptIds = [];
  for (const ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (const chunk of receiptIdChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (const receipt of receipts) {
          if (receipt.status === "ok") {
            continue;
          } else if (receipt.status === "error") {
            console.error(
              `There was an error sending a notification: ${receipt.message}`,
            );
            if (receipt.details && receipt.details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
              // You must handle the errors appropriately.
              console.error(`The error code is ${receipt.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};
