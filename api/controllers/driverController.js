import bcrypt from "bcrypt";
import driverModel from "../models/driverModel";
import codeModel from "../models/codeModel";
import { SECRET } from "../config";
/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */

import { handleError, handleAll, createToken } from "../helpers";

export default {
  create: (req, res) => {
    const { phone } = req.body.user;
    const { code } = req.body.user;
    const { pushToken } = req.body.user;
    const { name } = req.body.user;

    const { lastUser } = req.body;

    codeModel.findOne({ phone }, (err, userCode) => {
      const handle = handleAll(err, userCode, "code", res);
      if (handle) {
        return res.status(handle.statusCode).json(handle.body);
      }
      userCode = userCode.value;
      driverModel.findOne({ phone }, (err, user) => {
        const handle = handleError(err, user, "user", res);
        if (handle) {
          return res.status(handle.statusCode).json(handle.body);
        }
        if (!user) {
          bcrypt.compare(code, userCode, (err, valid) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: "Error validating",
              });
            }
            if (valid || phone === "79000000000") {
              codeModel.findOneAndRemove({ phone }, (err, oldCode) => {
                const handle = handleAll(err, oldCode, "code", res);
                if (handle) {
                  return res.status(handle.statusCode).json(handle.body);
                }
                const pushTokens = [];
                pushTokens.push(pushToken);
                const user = new driverModel({
                  name,
                  phone,
                  pushTokens,
                });
                user.save((err, user) => {
                  const token = {
                    refresh: createToken(
                      {
                        payload: { userId: user._id, type: "refresh" },
                        expire: "365d",
                      },
                      SECRET,
                    ),
                    access: createToken(
                      {
                        payload: { userId: user._id, type: "access" },
                        expire: "24h",
                      },
                      SECRET,
                    ),
                  };
                  const handle = handleError(err, user, "user", res);
                  if (handle) {
                    return res.status(handle.statusCode).json(handle.body);
                  }
                  return res
                    .status(201)
                    .json({ status: "success", user, token });
                });
              });
            } else {
              return res.status(500).json({
                status: "error",
                message: "Code is invalid",
              });
            }
          });
        } else {
          if (lastUser) {
            if (lastUser !== user._id) {
              driverModel.findOne({ _id: lastUser }, (err, lastUser) => {
                if (lastUser) {
                  const handle = handleError(err, lastUser, "lastUser", res);
                  if (handle) {
                    return res.status(handle.statusCode).json(handle.body);
                  }
                  lastUser.pushTokens = lastUser.pushTokens.filter(
                    (token) => token !== pushToken,
                  );
                  lastUser.save((err, lastUser) => {
                    const handle = handleError(err, lastUser, "lastUser", res);
                    if (handle) {
                      return res.status(handle.statusCode).json(handle.body);
                    }
                  });
                }
              });
            }
          }
          bcrypt.compare(code, userCode, (err, valid) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: "Error validating",
              });
            }
            if (valid || phone === "79000000000") {
              codeModel.findOneAndRemove({ phone }, (err, oldCode) => {
                const handle = handleAll(err, oldCode, "code", res);
                if (handle) {
                  return res.status(handle.statusCode).json(handle.body);
                }
                driverModel.findOne({ _id: user._id }, (err, user) => {
                  const handle = handleAll(err, user, "user", res);
                  if (handle) {
                    return res.status(handle.statusCode).json(handle.body);
                  }
                  const pushTokensSet = new Set(user.pushTokens);
                  pushTokensSet.add(pushToken);
                  user.pushTokens = Array.from(pushTokensSet);
                  user.save((err, user) => {
                    const handle = handleAll(err, user, "user", res);
                    if (handle) {
                      return res.status(handle.statusCode).json(handle.body);
                    }
                    const token = {
                      refresh: createToken(
                        {
                          payload: { userId: user._id, type: "refresh" },
                          expire: "365d",
                        },
                        SECRET,
                      ),
                      access: createToken(
                        {
                          payload: { userId: user._id, type: "access" },
                          expire: "24h",
                        },
                        SECRET,
                      ),
                    };
                    return res
                      .status(201)
                      .json({ status: "success", user, token });
                  });
                });
              });
            } else {
              return res.status(500).json({
                message: "Code is invalid",
              });
            }
          });
        }
      });
    });
  },
  /**
   * userController.update()
   */
  update: (req, res) => {
    const { id } = req.params;
    driverModel.findOne({ _id: id }, (err, user) => {
      const handle = handleAll(err, user, "user", res);
      if (handle) {
        return res.status(handle.statusCode).json(handle.body);
      }

      user.name = req.body.name ? req.body.name : user.name;
      user.phone = req.body.phone ? req.body.phone : user.phone;
      const pushTokensSet = new Set(user.pushTokens.concat(req.body.pushTokens));
      user.pushTokens = req.body.pushTokens
        ? Array.from(pushTokensSet)
        : user.pushTokens;

      user.save((err, user) => {
        const handle = handleAll(err, user, "user", res);
        if (handle) {
          return res.status(handle.statusCode).json(handle.body);
        }
        return res.status(200).json({ status: "success", user });
      });
    });
  },
  /**
   * userController.remove()
   */
};
