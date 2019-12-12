import subscriptionModel from "../models/subscriptionModel";

const subscriptions = {};
const crypto = require("crypto");
const webpush = require("web-push");

const vapidKeys = {
  privateKey: "bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU",
  publicKey:
    "BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8"
};

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

function createHash(input) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(Buffer.from(input));
  return md5sum.digest("hex");
}

function handlePushNotificationSubscription(req, res) {
  const subscriptionRequest = req.body;
  const susbscriptionId = createHash(JSON.stringify(subscriptionRequest));
  subscriptions[susbscriptionId] = subscriptionRequest;
  console.log({ id: susbscriptionId, sub: subscriptions[susbscriptionId] });
  res
    .status(201)
    .json({ id: susbscriptionId, sub: subscriptions[susbscriptionId] });
}

function sendPushNotification(req, res) {
  console.log("ANAL", req.params.id);
  // const subscriptionId = req.params.id;
  // const pushSubscription = subscriptions[subscriptionId];
  // webpush
  //   .sendNotification(
  //     pushSubscription,
  //     JSON.stringify({
  //       title: "New Product Available ",
  //       text: "HEY! Take a look at this brand new t-shirt!",
  //       image: "/images/jason-leung-HM6TMmevbZQ-unsplash.jpg",
  //       tag: "new-product",
  //       url: "/new-product-jason-leung-HM6TMmevbZQ-unsplash.html",
  //     }),
  //   )
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // res.status(202).json({});
  subscriptionModel.findOne(
    { adminSubscription: req.params.id },
    (err, subscription) => {
      console.log("MEMOLOG", subscription);
      if (subscription) {
        const pushSubscription = subscription.aSub;
        webpush
          .sendNotification(
            pushSubscription,
            JSON.stringify({
              title: "New Product Available ",
              text: "HEY! Take a look at this brand new t-shirt!",
              image: "/images/jason-leung-HM6TMmevbZQ-unsplash.jpg",
              tag: "new-product",
              url: "/new-product-jason-leung-HM6TMmevbZQ-unsplash.html"
            })
          )
          .catch(err => {
            console.log(err);
          });

        res.status(202).json({});
      }
    }
  );
}
function subscribe(req, res) {
  subscriptionModel.findOne({ email: req.body.email }, (err, subscription) => {
    if (!subscription) {
      const subscription = new subscriptionModel({
        email: req.body.email,
        adminSubscription: req.body.adminSubscription,
        aSub: req.body.aSub
      });
      subscription.save(err => {
        console.log(err);
      });
    } else {
      subscriptionModel.updateOne(
        { email: req.body.email },
        {
          $set: {
            adminSubscriptionId: req.body.adminSubscription,
            aSub: req.body.aSub
          }
        },
        (error, success) => {
          if (error) {
            console.log(error);
          } else {
            console.log(success);
          }
        }
      );
    }
  });
}

export default {
  handlePushNotificationSubscription,
  sendPushNotification,
  subscribe
};
