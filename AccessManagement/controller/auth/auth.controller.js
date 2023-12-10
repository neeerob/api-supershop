const statusCode = require("../../core/status/statusCode");
const {
  Login,
  Register,
  updatePassword,
  resetPassword,
  update,
  profile,
  findMany,
  RegComplete,
  userInfo,
} = require("../../core/services/auth");

const createErrorMessage = (message, data) => {
  return {
    status: statusCode.internalServerError,
    data: data,
    error: true,
    message: message,
  };
};

module.exports = {
  async Login(req, res) {
    try {
      let auth = {};
      console.log("data", req.body);
      const response = await Login(req.body, req, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async Reg(req, res) {
    try {
      let auth = {};
      let data = req.body;
      console.log("data", req.body);
      const response = await Register(data, req, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async RegComplete(req, res) {
    try {
      let auth = {};
      let data = req.body;
      const response = await RegComplete(data, req, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async updatePassword(req, res) {
    try {
      let auth = {};
      const response = await updatePassword(req.body, req, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async resetPassword(req, res) {
    try {
      let auth = {};
      const response = await resetPassword(req.body, req, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async update(req, res) {
    try {
      let auth = {};
      let username = req.params.username;
      const response = await update(req.body, username, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async profile(req, res) {
    try {
      let auth = {};
      const response = await profile(req.user, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async userInfo(req, res) {
    try {
      let auth = {};
      const response = await userInfo(req.user, auth);
      return res.status(response.status).json(response);
    } catch (error) {
      console.error(error);
      const newError = createErrorMessage();
      newError.data = error;
      newError.message = "Auth service Internal Server Error";
      newError.status = statusCode.internalServerError;
      newError.error = true;
      return res.status(newError.status).json(newError);
    }
  },
  async getAllUsers(req, res) {
    try {
      let skip = 0,
        limit = 0;
      if (req.query.skip) {
        skip = parseInt(req.query.skip);
      }
      if (req.query.limit) {
        limit = parseInt(req.query.limit);
      }
      console.log(skip, limit);
      let postCode = {};
      let response = await findMany(req.body, postCode, skip, limit, {
        _id: -1,
      });
      return res.status(200).send(response);
    } catch (err) {
      console.log(err);
      let newError = createErrorMessage();
      newError.status = statusCode.internalServerError;
      newError.message = "Auth Service Internal Server Error";
      return res.status(statusCode).send(newError);
    }
  },
};
