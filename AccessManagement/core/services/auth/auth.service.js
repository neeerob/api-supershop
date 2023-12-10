const statusCode = require("../../status/statusCode");
const { createObject, response } = require("./createObject");
const { db } = require("../../../../lib/database");
const authView = require("./auth.view");
const { duplicate } = require("../duplication");
const userCollection = "Users";
const authSession = "sessions";
const bcrypt = require("bcrypt");
const config = process.env;
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const userView = require("./user.view");
const userType = require("./user.type");
const companyView = require("./company.view");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
// const companyService = require("./../../../../core/services/settings/company");

const authSessionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  createTimestamp: { type: Date, default: Date.now() },
  expireTimestamp: { type: Date, required: true },
  flag: { type: Boolean, default: false },
});

// Define your model
const AuthSession = mongoose.model("sessions", authSessionSchema);

async function createFingerprint(fingerprint) {
  const hashedFingerprint = crypto
    .createHash("sha256")
    .update(fingerprint)
    .digest("hex");
  return hashedFingerprint;
}

// async function createSession(username, ip, agent) {
//   try {
//     let ifExist = await db
//       .collection(authSession)
//       .findOne({ username: username.toLowerCase() });
//     if (ifExist.error === false) {
//       ifExist.data.expireTimestamp = new Date(+new Date() + 100 * 60 * 1000);
//       let expireTimestamp = ifExist.data.expireTimestamp;
//       // let key = ifExist.data._id.toString();
//       let key = ifExist.data._id;
//       console.log("key", key);
//       console.log("ifExist", ifExist.data);
//       const filter = { _id: key };
//       const updateExp = await db
//         .collection(authSession)
//         .updateOne(filter, { $set: ifExist.data });

//       // console.log(updateExp);
//       return ifExist.data._id;
//     } else {
//       const session = await db.collection(authSession).insert({
//         username: username.toLowerCase(),
//         ipAddress: ip,
//         userAgent: agent,
//         createTimestamp: Date.now(),
//         expireTimestamp: new Date(+new Date() + 100 * 60 * 1000), //change sessionn time here
//         flag: false,
//       });
//       return session.data._id.toString();
//     }
//   } catch (error) {
//     console.error("Session creation failed:", error);
//     return null;
//   }
// }

async function createSession(username, ip, agent) {
  try {
    let ifExist = await AuthSession.findOne({
      username: username.toLowerCase(),
    });

    if (ifExist) {
      // Session exists, update expiration timestamp
      ifExist.expireTimestamp = new Date(+new Date() + 100 * 60 * 1000);
      let expireTimestamp = ifExist.expireTimestamp;
      console.log("key", ifExist._id);
      console.log("ifExist", ifExist);

      // Save the updated session
      await ifExist.save();

      return ifExist._id;
    } else {
      // Session doesn't exist, create a new one
      const session = await AuthSession.create({
        username: username.toLowerCase(),
        ipAddress: ip,
        userAgent: agent,
        createTimestamp: Date.now(),
        expireTimestamp: new Date(+new Date() + 100 * 60 * 1000), // change session time here
        flag: false,
      });

      return session._id.toString();
    }
  } catch (error) {
    console.error("Session creation failed:", error);
    return null;
  }
}

async function RegisterService(data, req, auth) {
  try {
    let model = createObject(data).model;
    const { email, phone, type, username, password } = model;

    if (!(email && password && phone && type && username)) {
      return {
        status: statusCode.notAcceptable,
        message: "Provide proper information.",
        error: true,
        data: null,
      };
    }

    let existingUser = await duplicate.has(userCollection, {
      email: model.email,
    });

    let existingUser2 = await duplicate.has(userCollection, {
      username: model.username,
    });

    if (existingUser || existingUser2) {
      return {
        status: statusCode.notAcceptable,
        message: "User already exists by same email and username.",
        error: true,
        data: null,
      };
    }
    try {
      model.type = parseInt(type);
    } catch (err) {
      console.log(err);
      return {
        status: statusCode.notAcceptable,
        message: "User type must be a number.",
        error: true,
        data: null,
      };
    }
    // model.type = userType[model.type];
    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await db.collection(userCollection).insert(
      {
        type: model.type,
        username: username,
        phone: phone,
        email: email.toLowerCase(),
        password: encryptedPassword,
        isActive: true,
      },
      userView
    );
    // console.log(user, "user");

    // const user = await User.create({
    //   first_name,
    //   last_name,
    //   email: email.toLowerCase(),
    //   password: encryptedPassword,
    // });

    // const userAgent = req.get("user-agent");
    // const createdSession = await createSession(email, req.ip, userAgent);

    // if (!createdSession) {
    //   return {
    //     status: statusCode.internalServerError,
    //     message: "Failed to create session.",
    //     error: true,
    //     data: null,
    //   };
    // }

    // const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 630;
    // let fingerPrintHash = await createFingerprint(req.body.fingerprint);
    // const token = jwt.sign(
    //   {
    //     fingerPrintHash,
    //     createdSession,
    //     expireTimestamp: expirationTimeInSeconds,
    //   },
    //   process.env.TOKEN_KEY,
    //   { expiresIn: "2h" }
    // );
    // user.data.token = token;
    return {
      status: statusCode.success,
      message: "Success",
      error: false,
      data: user.data,
    };
  } catch (error) {
    console.error(error);
    return {
      status: statusCode.internalServerError,
      message: "Auth service internal Server Error",
      error: true,
      data: error,
    };
  }
}

module.exports = {
  async Login(data, req, auth) {
    try {
      let model = createObject(data).model;
      const { username, password } = model;
      if (!(username && password)) {
        return {
          status: statusCode.noContent,
          message: "Provide proper information.",
          error: true,
          data: null,
        };
      }
      const user = await db
        .collection(userCollection)
        .findOne({ username: username });
      if (user.error === true) {
        return {
          status: statusCode.notFound,
          message: "User not found.",
          error: true,
          data: null,
        };
      }
      let passwordCheck = await bcrypt.compare(password, user.data.password);
      if (!passwordCheck) {
        return {
          status: statusCode.notFound,
          message: "Password not matched.",
          error: true,
          data: null,
        };
      }
      if (user && passwordCheck) {
        const userAgent = req.get("user-agent");
        const createdSession = await createSession(username, req.ip, userAgent);

        if (!createdSession) {
          return {
            status: statusCode.internalServerError,
            message: "Auth service login innternal Server Error",
            error: true,
            data: null,
          };
        }

        // const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 630; // 10.5 minutes in seconds // Push it tto the .env file
        const expirationTimeInSeconds =
          Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 1 day in sec
        // console.log(expirationTimeInSeconds, expirationTimeInSeconds1);
        // let fingerPrintHash = await createFingerprint(req.body.fingerprint);
        const token = jwt.sign(
          {
            // fingerPrintHash,
            createdSession,
            expireTimestamp: expirationTimeInSeconds,
          },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h", // in .env file
          }
        );
        user.token = token;
        return {
          status: statusCode.success,
          message: "Success",
          error: false,
          data: token,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status: statusCode.internalServerError,
        message: "Auth service Internal Server Error",
        error: true,
        data: error,
      };
    }
  },
  async Register(data, req, auth) {
    try {
      let model = createObject(data).model;
      const { email, phone, type, username, password } = model;

      if (!(email && password && phone && type && username)) {
        return {
          status: statusCode.notAcceptable,
          message: "Provide proper information.",
          error: true,
          data: null,
        };
      }

      let existingUser = await duplicate.has(userCollection, {
        email: model.email,
      });

      let existingUser2 = await duplicate.has(userCollection, {
        username: model.username,
      });

      if (existingUser || existingUser2) {
        return {
          status: statusCode.notAcceptable,
          message: "User already exists by same email and username.",
          error: true,
          data: null,
        };
      }
      try {
        model.type = parseInt(type);
      } catch (err) {
        console.log(err);
        return {
          status: statusCode.notAcceptable,
          message: "User type must be a number.",
          error: true,
          data: null,
        };
      }
      // model.type = userType[model.type];
      const encryptedPassword = await bcrypt.hash(password, 10);
      const user = await db.collection(userCollection).insert(
        {
          type: model.type,
          username: username,
          phone: phone,
          email: email.toLowerCase(),
          password: encryptedPassword,
          isActive: true,
        },
        userView
      );
      // console.log(user, "user");

      // const user = await User.create({
      //   first_name,
      //   last_name,
      //   email: email.toLowerCase(),
      //   password: encryptedPassword,
      // });

      // const userAgent = req.get("user-agent");
      // const createdSession = await createSession(email, req.ip, userAgent);

      // if (!createdSession) {
      //   return {
      //     status: statusCode.internalServerError,
      //     message: "Failed to create session.",
      //     error: true,
      //     data: null,
      //   };
      // }

      // const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 630;
      // let fingerPrintHash = await createFingerprint(req.body.fingerprint);
      // const token = jwt.sign(
      //   {
      //     fingerPrintHash,
      //     createdSession,
      //     expireTimestamp: expirationTimeInSeconds,
      //   },
      //   process.env.TOKEN_KEY,
      //   { expiresIn: "2h" }
      // );
      // user.data.token = token;
      return {
        status: statusCode.success,
        message: "Success",
        error: false,
        data: user.data,
      };
    } catch (error) {
      console.error(error);
      return {
        status: statusCode.internalServerError,
        message: "Auth service internal Server Error",
        error: true,
        data: error,
      };
    }
  },
  // async RegComplete(data, auth) {
  //   try {
  //     // console.log(data.userInfo);
  //     // console.log(data.profileInfo);
  //     let userReg = await RegisterService(data.userInfo);
  //     // console.log(userReg);
  //     // console.log("id", userReg.data._id);
  //     if (!userReg.error) {
  //       data.profileInfo.userId = userReg.data._id.toString();
  //       data.profileInfo.email = data.userInfo.email;
  //       let comRegister = await companyService.create(data.profileInfo);
  //       // console.log(comRegister);
  //       if (!comRegister.error) {
  //         return {
  //           status: statusCode.success,
  //           message: "Success",
  //           error: false,
  //           data: {
  //             userInfo: userReg.data,
  //             comRegister: comRegister.data.data,
  //           },
  //         };
  //       }
  //     }
  //     return {
  //       status: statusCode.internalServerError,
  //       message: "Auth service internal Server Error",
  //       error: true,
  //       data: data.userInfo,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     return {
  //       status: statusCode.internalServerError,
  //       message: "Auth service internal Server Error",
  //       error: true,
  //       data: error,
  //     };
  //   }
  // },
  async updatePassword(data, req, auth) {
    try {
      let model = createObject(data).model;
      const { username, password, newPassword } = model;
      if (!(username && password && newPassword)) {
        return {
          status: statusCode.noContent,
          message: "Provide proper information.",
          error: true,
          data: null,
        };
      }

      const user = await db
        .collection(userCollection)
        .findOne({ username: username });
      if (user.error === true) {
        return {
          status: statusCode.notFound,
          message: "User not found.",
          error: true,
          data: null,
        };
      }
      let passwordCheck = await bcrypt.compare(password, user.data.password);
      if (!passwordCheck) {
        return {
          status: statusCode.notFound,
          message: "Password not matched.",
          error: true,
          data: null,
        };
      }
      if (user && passwordCheck) {
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        user.data.password = encryptedPassword;
        const undateUserInfo = await db
          .collection(userCollection)
          .update(user.data._id, user.data, userView);

        return {
          status: statusCode.success,
          message: "Success",
          error: false,
          data: undateUserInfo.data.data,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status: statusCode.internalServerError,
        message: "Auth service Internal Server Error",
        error: true,
        data: error,
      };
    }
  },
  async resetPassword(data, req, auth) {
    try {
      let model = createObject(data).model;
      const { username, newPassword } = model;
      if (!(username && newPassword)) {
        return {
          status: statusCode.noContent,
          message: "Provide proper information.",
          error: true,
          data: null,
        };
      }

      const user = await db
        .collection(userCollection)
        .findOne({ username: username });
      if (user.error === true) {
        return {
          status: statusCode.notFound,
          message: "User not found.",
          error: true,
          data: null,
        };
      }
      // let flag = await bcrypt.compare(password, user.data.password);
      // if (!flag) {
      //   return {
      //     status: statusCode.notFound,
      //     message: "Password not matched.",
      //     error: true,
      //     data: null,
      //   };
      // }
      if (user) {
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        user.data.password = encryptedPassword;
        const undateUserInfo = await db
          .collection(userCollection)
          .update(user.data._id, user.data, userView);

        return {
          status: statusCode.success,
          message: "Success",
          error: false,
          data: undateUserInfo.data.data,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status: statusCode.internalServerError,
        message: "Auth service Internal Server Error",
        error: true,
        data: error,
      };
    }
  },
  async update(data, username, auth) {
    try {
      let model = createObject(data).model;
      const { phone, email, password } = model;
      if (!(phone || password || password === null || password === undefined)) {
        return {
          status: statusCode.noContent,
          message: "Provide proper information.",
          error: true,
          data: null,
        };
      }
      // if (password === null || password === undefined) {
      //   return {
      //     status: statusCode.noContent,
      //     message: "Provide password.",
      //     error: true,
      //     data: null,
      //   };
      // }

      const user = await db
        .collection(userCollection)
        .findOne({ username: username });
      if (user.error === true) {
        return {
          status: statusCode.notFound,
          message: "User not found.",
          error: true,
          data: null,
        };
      }
      let passwordCheck = true;
      try {
        passwordCheck = await bcrypt.compare(password, user.data.password);
      } catch (e) {
        passwordCheck = false;
        return {
          status: statusCode.notFound,
          message: "Password mismatched.",
          error: true,
          data: null,
        };
      }
      if (!passwordCheck) {
        return {
          status: statusCode.notFound,
          message: "Password not matched.",
          error: true,
          data: null,
        };
      }
      if (user && passwordCheck) {
        // const encryptedPassword = await bcrypt.hash(newPassword, 10);
        user.data.phone = phone;
        const undateUserInfo = await db
          .collection(userCollection)
          .update(user.data._id, user.data, userView);

        return {
          status: statusCode.success,
          message: "Success",
          error: false,
          data: undateUserInfo.data.data,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status: statusCode.internalServerError,
        message: "Auth service Internal Server Error",
        error: true,
        data: error,
      };
    }
  },
  async profile(user) {
    try {
      // try {
      //   console.log(user._id);
      //   switch (user.type) {
      //     case userType[3]:
      //       let key = user._id.toString();
      //       let company = await db
      //         .collection(user.type)
      //         .findOne({ userId: key }, companyView);
      //       // console.log("cmp", company.data.userId);
      //       // console.log("user", user._id.toString());
      //       if (!company.error) {
      //         user.company = company.data;
      //       } else {
      //         return {
      //           status: statusCode.notFound,
      //           message: "No data found for company",
      //           error: true,
      //           data: null,
      //         };
      //       }
      //       break;
      //     case userType[2]:
      //       console.log("dc");
      //       break;
      //     case userType[1]:
      //       console.log("admin");
      //       break;
      //     default:
      //       break;
      //   }
      //   // console.log(user.type);
      // } catch (error) {
      //   console.error(error);
      //   return {
      //     status: statusCode.internalServerError,
      //     message: "Auth service Internal Server Error",
      //     error: true,
      //     data: error,
      //   };
      // }
      return {
        status: statusCode.success,
        message: "Success",
        error: false,
        data: user,
      };
    } catch (error) {
      console.error(error);
      return {
        status: statusCode.internalServerError,
        message: "Auth service Internal Server Error",
        error: true,
        data: error,
      };
    }
  },
  async userInfo(user) {
    try {
      let data = null;
      let collectionName = userType[user.type];
      // console.log("cn", user.type, collectionName);
      try {
        // console.log(user._id);
        switch (collectionName) {
          case userType[3]:
            let key = user._id.toString();
            let company = await db
              .collection(collectionName)
              .findOne({ userId: key }, companyView);
            // console.log("cmp", company.data.userId);
            // console.log("user", user._id.toString());
            if (!company.error) {
              company.data.type = user.type;
              data = company.data;
            } else {
              return {
                status: statusCode.notFound,
                message: "No data found for company",
                error: true,
                data: null,
              };
            }
            break;
          case userType[2]:
            console.log("dc");
            break;
          case userType[1]:
            console.log("admin");
            break;
          default:
            break;
        }
        // console.log(user.type);
      } catch (error) {
        console.error(error);
        return {
          status: statusCode.internalServerError,
          message: "Auth service Internal Server Error",
          error: true,
          data: error,
        };
      }
      if (data !== null) {
        return {
          status: statusCode.success,
          message: "Success",
          error: false,
          data: data,
        };
      }
      return {
        status: statusCode.notFound,
        message: "User type not valid",
        error: true,
        data: data,
      };
    } catch (error) {
      console.error(error);
      return {
        status: statusCode.internalServerError,
        message: "Auth service Internal Server Error",
        error: true,
        data: error,
      };
    }
  },
  async findMany() {
    try {
      let argLen = arguments.length;
      let result = null;
      if (argLen < 2 || argLen > 5) {
        result = result = await db.collection(userCollection).findMany();
      } else if (argLen == 2) {
        result = await db.collection(userCollection).findMany(arguments[0], {});
      } else if (argLen == 3) {
        result = await db
          .collection(userCollection)
          .findMany(arguments[0], {}, arguments[2]);
      } else if (argLen == 4) {
        result = await db
          .collection(userCollection)
          .findMany(arguments[0], {}, arguments[2], arguments[3]);
      } else if (argLen == 5) {
        result = await db
          .collection(userCollection)
          .findMany(arguments[0], {}, arguments[2], arguments[3], arguments[4]);
      }

      if (!result.error) {
        return {
          status: statusCode.success,
          message: "Success",
          error: false,
          data: result.data,
        };
      } else {
        return {
          status: statusCode.internalServerError,
          message: "Auth Internal Server Error",
          error: true,
          data: null,
        };
      }
    } catch (err) {
      console.error(err);
      return {
        status: statusCode.internalServerError,
        message: "Auth Internal Server Error",
        error: true,
        data: error,
      };
    }
  },
};
