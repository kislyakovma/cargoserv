import bcrypt from "bcrypt";
import smsRu from "sms_ru";
import codeModel from "../models/codeModel.js";
import {
  generateCode, handleError, handleAll, longAgo,
} from "../helpers";
import { SMS_TIMER, SALT_ROUNDS, SMS_API } from "../config";

const sms = new smsRu(SMS_API);

export default {
  create: (req, res) => {
    const { phone } = req.body;
    codeModel.findOne({ phone }, (err, code) => {
      if (err) {
        return {
          message: "Error when getting code.",
          error: err,
          status: "error",
        };
      }
      if (!code) {
        const plaincode = generateCode();
        sms.sms_send(
          {
            to: phone,
            from: "Gent.Coffee",
            text: plaincode,
          },
          (smsState) => {
            if (smsState.code !== "100") {
              res
                .status(500)
                .json({ status: "error", message: "SMS not sent" });
            } else {
              bcrypt.hash(plaincode, SALT_ROUNDS, (err, hash) => {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: "Hashing error",
                  });
                }
                const code = new codeModel({
                  phone: req.body.phone,
                  value: hash,
                  date: new Date(),
                  smsId: smsState.ids,
                });
                code.save((err, code) => {
                  const handle = handleError(err, code, "code", res);
                  if (handle) {
                    return res.status(handle.statusCode).json(handle.body);
                  }
                  setTimeout(() => {
                    codeModel.findByIdAndRemove(code._id, (err, code) => {
                      handleError(err, code, "code", res);
                    });
                  }, SMS_TIMER * 1000);
                  return res.status(201).json({ status: "success" });
                });
              });
            }
          },
        );
      } else if (longAgo(code.date) > SMS_TIMER) {
        codeModel.findOneAndRemove({ phone }, (err, oldCode) => {
          const handle = handleAll(err, oldCode, "code", res);
          if (handle) {
            return res.status(handle.statusCode).json(handle.body);
          }
          const plaincode = generateCode();
          sms.sms_send(
            {
              to: phone,
              from: "Gent.Coffee",
              text: plaincode,
            },
            (smsState) => {
              if (smsState.code !== "100") {
                res
                  .status(500)
                  .json({ status: "error", message: "SMS not sent" });
              } else {
                bcrypt.hash(plaincode, SALT_ROUNDS, (err, hash) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: "Hashing error",
                    });
                  }
                  const code = new codeModel({
                    phone: req.body.phone,
                    value: hash,
                    date: new Date(),
                    smsId: smsState.ids,
                  });
                  code.save((err, code) => {
                    const handle = handleError(err, code, "code", res);
                    if (handle) {
                      return res.status(handle.statusCode).json(handle.body);
                    }
                    setTimeout(() => {
                      codeModel.findByIdAndRemove(code._id, (err, code) => {
                        handleError(err, code, "code", res);
                      });
                    }, SMS_TIMER * 1000);
                    return res.status(201).json({ status: "success" });
                  });
                });
              }
            },
          );
        });
      } else {
        sms.sms_status(code.smsId, (smsStatus) => {
          if (smsStatus.code !== "103" && smsStatus.code !== "102") {
            codeModel.findOneAndRemove({ phone }, (err, oldCode) => {
              const handle = handleAll(err, oldCode, "code", res);
              if (handle) {
                return res.status(handle.statusCode).json(handle.body);
              }
              const plaincode = generateCode();
              sms.sms_send(
                {
                  to: phone,
                  from: "Gent.Coffee",
                  text: plaincode,
                },
                (smsState) => {
                  if (smsState.code !== "100") {
                    res
                      .status(500)
                      .json({ status: "error", message: "SMS not sent" });
                  } else {
                    bcrypt.hash(plaincode, SALT_ROUNDS, (err, hash) => {
                      if (err) {
                        return res.status(500).json({
                          status: "error",
                          message: "Hashing error",
                        });
                      }
                      const code = new codeModel({
                        phone: req.body.phone,
                        value: hash,
                        date: new Date(),
                        smsId: smsState.ids,
                      });
                      code.save((err, code) => {
                        const handle = handleError(err, code, "code", res);
                        if (handle) {
                          return res
                            .status(handle.statusCode)
                            .json(handle.body);
                        }
                        setTimeout(() => {
                          codeModel.findByIdAndRemove(code._id, (err, code) => {
                            handleError(err, code, "code", res);
                          });
                        }, SMS_TIMER * 1000);
                        return res.status(201).json({ status: "success" });
                      });
                    });
                  }
                },
              );
            });
          } else {
            return res.status(500).json({
              status: "error",
              message: "Code exists",
              time: Math.ceil(SMS_TIMER - longAgo(code.date)),
            });
          }
        });
      }
    });
  },
};
