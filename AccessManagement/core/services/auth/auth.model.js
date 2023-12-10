module.exports = {
  postCodeModel: (function () {
    return {
      division: {
        type: "string",
        required: true,
        default: "",
        min: 3,
        max: 25,
      },
      divisionId: {
        type: "number",
        required: true,
        default: "",
      },
      name: {
        type: "string",
        required: true,
        default: "",
        min: 3,
        max: 25,
      },
      bnName: {
        type: "string",
        required: true,
        default: "",
        min: 3,
        max: 25,
      },
      district: {
        type: "string",
        required: true,
        default: "",
        min: 3,
        max: 25,
      },
      districtId: {
        type: "number",
        required: true,
        default: "",
      },
      thana: {
        type: "string",
        required: true,
        default: "",
        min: 3,
        max: 35,
      },
      postOffice: {
        type: "string",
        required: true,
        default: "",
        min: 3,
        max: 40,
      },
      postCode: {
        type: "number",
        required: true,
        default: "",
      },
    };
  })(),
};
