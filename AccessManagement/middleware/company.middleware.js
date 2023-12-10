const statusCode = require("../core/status/statusCode");

const cmpMiddleware = async (req, res, next) => {
  try {
    if (req.user.type === 3) {
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
      message: "Internal server error in admmin middleware",
      data: null,
      status: statusCode.unAuthorized,
      error: true,
    });
  }
};

module.exports = cmpMiddleware;
