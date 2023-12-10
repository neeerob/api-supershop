const statusCode = require("../core/status/statusCode");

const universalMiddleware = (allowedUserTypes) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (allowedUserTypes.includes(user.type)) {
        return next();
      } else {
        return res.status(statusCode.unAuthorized).send({
          message: "You are not allowed to access this route",
          data: null,
          status: statusCode.unAuthorized,
          error: true,
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(statusCode.unAuthorized).send({
        message: "Internal server error in universal middleware",
        data: null,
        status: statusCode.unAuthorized,
        error: true,
      });
    }
  };
};

module.exports = universalMiddleware;
