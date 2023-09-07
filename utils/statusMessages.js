// const statusMessages = {
//     200: 'OK',
//     201: 'Created',
//     400: 'Bad Request',
//     401: 'Unauthorized',
//     404: 'Not Found',
//     500: 'Internal Server Error',
// };

const statusModel = {
    success: {
      code: 200,
      message: "Success"
    },
    created: {
      code: 201,
      message: "Created"
    },
    accepted: {
      code: 202,
      message: "Accepted"
    },
    noContent: {
      code: 204,
      message: "No Content"
    },
    badRequest: {
      code: 400,
      message: "Bad Request"
    },
    unauthorized: {
      code: 401,
      message: "Unauthorized"
    },
    forbidden: {
      code: 403,
      message: "Forbidden"
    },
    notFound: {
      code: 404,
      message: "Not Found"
    },
    methodNotAllowed: {
      code: 405,
      message: "Method Not Allowed"
    },
    conflict: {
      code: 409,
      message: "Conflict"
    },
    internalServerError: {
      code: 500,
      message: "Internal Server Error"
    },
    serviceUnavailable: {
      code: 503,
      message: "Service Unavailable"
    },
  };
  
module.exports = statusModel;
  