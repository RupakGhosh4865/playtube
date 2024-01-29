import asynchandler from "../utils/asynchandler.js";
import apiresponse from "../utils/apiresponse.js";

const healthcheck = asynchandler(async (req, res) => {
   return res
      .status(200)
      .json(new apiresponse(201, { message: "Everything is Ok" }, "Done"));
});

export { healthcheck };