const jwt = require("jsonwebtoken");
const config = process.env;
const crypto = require("crypto");
const bodyParser = require("body-parser");
const { Session } = require("inspector");
const userCollection = "Users";
const authSession = "sessions";
const { request } = require("http");
const { db } = require("../../lib/database");
const userView = require("./../core/services/auth/user.view");
const statusCode = require("../core/status/statusCode");
const { ObjectId } = require("mongodb");

async function createFinger(fingerprint) {
  const hashedFingerprint = crypto
    .createHash("sha256")
    .update(fingerprint)
    .digest("hex");
  return hashedFingerprint;
}

const authMiddleware = async (req, res, next) => {
  // console.log("hit");
  // console.log("Fingerprint:", req.body.headers.fingerprint);
  let token = null;
  try {
    token =
      req.headers["authorization"] ||
      req.body.headers.Authorization ||
      req.body.headers["Authorization"];
  } catch (e) {
    return res.status(statusCode.unAuthorized).send({
      message: "Missing token",
      data: null,
      status: statusCode.unAuthorized,
      error: true,
    });
  }
  let decoded = null;
  if (!token) {
    return res.status(statusCode.unAuthorized).send({
      message: "Missing token",
      data: null,
      status: statusCode.unAuthorized,
      error: true,
    });
  }
  // console.log("token", token);

  try {
    decoded = jwt.verify(token, config.TOKEN_KEY);
    // console.log(decoded);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // console.log(currentTimestamp, decoded.expireTimestamp);
    if (decoded.expireTimestamp && decoded.expireTimestamp < currentTimestamp) {
      // console.log("Expired token");
      return res.status(statusCode.unAuthorized).send({
        message: "Expired token",
        data: null,
        status: statusCode.unAuthorized,
        error: true,
      });
    }
    req.token = token;
    req.user = decoded;
    // let fingerHash = await createFinger(req.body.headers.fingerprint);
    // if (fingerHash !== decoded.fingerPrintHash) {
    //   // console.log("Token hijacked!! Logged out and cleaned session");
    //   return res.status(200).send({
    //     message: "Token hijacked!! Logged out and cleaned session.",
    //     data: null,
    //     error: true,
    //     status: 401,
    //   });
    // }
    try {
      let sessionId = decoded.createdSession;
      // console.log("sessionId - 1", sessionId);
      // let session = await SessionCollection.findOne({ _id: sessionId });
      let key = sessionId;
      key = new ObjectId(key);
      // console.log("key - 1", key);
      let session = await db.collection(authSession).findOne(key);
      // console.log("session", session);
      // console.log("session", session);
      if (session.error === false) {
        let currentTimestamp = new Date();
        let expireTimestamp = new Date(session.data.expireTimestamp);

        if (currentTimestamp > expireTimestamp) {
          return res.status(statusCode.unAuthorized).send({
            message: "Session Expired",
            data: null,
            status: statusCode.unAuthorized,
            error: true,
          });
        } else {
          let user = await db
            .collection(userCollection)
            .findOne({ username: session.data.username }, userView);
          // console.log("user", user);
          if (user.error === false) {
            req.user = user.data;
            // console.log("req.user", req.user);
            return next();
          } else {
            return res.status(statusCode.unAuthorized).send({
              message: "User not found, please log in again",
              data: null,
              status: statusCode.unAuthorized,
              error: true,
            });
          }
        }
      } else {
        return res.status(statusCode.unAuthorized).send({
          message: "Session not found, please log in again",
          data: null,
          status: statusCode.unAuthorized,
          error: true,
        });
      }
    } catch (err) {
      console.error(err);
      // return res.status(200).send({
      //   message: "Request expire!",
      //   data: null,
      //   error: true,
      //   status: 401,
      // });
      return res.status(statusCode.unAuthorized).send({
        message: "Request expire",
        data: null,
        status: statusCode.unAuthorized,
        error: true,
      });
    }
  } catch (err) {
    console.error(err);
    // return res.status(200).send({
    //   message: "Invalid session",
    //   data: null,
    //   error: true,
    //   status: 401,
    // });
    return res.status(statusCode.unAuthorized).send({
      message: "Invalid session",
      data: null,
      status: statusCode.unAuthorized,
      error: true,
    });
  }
};

module.exports = authMiddleware;
