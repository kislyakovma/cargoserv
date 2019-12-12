import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateCode = () => {
  const code = parseInt(crypto.randomBytes(3).toString("hex"), 16)
    .toString()
    .substr(0, 4);
  return code;
};
const handleAll = (err, object, objectName, res) => {
  if (err) {
    return {
      statusCode: 500,
      body: {
        status: "error",
        message: `Error when getting ${objectName}.`,
        error: err,
      },
    };
  }
  if (!object) {
    return {
      statusCode: 404,
      body: {
        status: "error",
        message: `No such ${objectName}.`,
      },
    };
  }
  return false;
};
const handleNotFound = (object, objectName, res) => {
  if (!object) {
    return {
      statusCode: 404,
      body: {
        status: "error",
        message: `No such ${objectName}.`,
      },
    };
  }
  return false;
};
const handleError = (err, object, objectName, res) => {
  if (err) {
    return {
      statusCode: 500,
      body: {
        status: "error",
        message: `Error when getting ${objectName}.`,
        error: err,
      },
    };
  }
  return false;
};
const longAgo = (date) => {
  const now = new Date();
  return Math.abs((now.getTime() - date.getTime()) / 1000);
};
const checkToken = (req, secret, type) => {
  let token = req.headers["x-access-token"] || req.headers.authorization; // Express headers are auto converted to lowercase
  if (token) {
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
  }
  if (token) {
    let response = {
      status: "error",
      message: "Token couldn`t be verified",
    };
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        response = {
          status: "error",
          message: "Token is not valid",
        };
      } else if (decoded.payload.type === type) {
        response = {
          status: "success",
          decoded,
        };
      }
    });
    return response;
  }
  return {
    status: "error",
    message: "Auth token is not supplied",
  };
};
const createToken = (details, secret) => jwt.sign({ payload: details.payload }, secret, {
  expiresIn: details.expire,
});
export {
  generateCode,
  createToken,
  checkToken,
  handleAll,
  handleNotFound,
  handleError,
  longAgo,
};
