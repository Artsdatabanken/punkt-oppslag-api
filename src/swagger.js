import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" with {type: "json"};

function init(app) {
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

//module.exports = { init };
export default init;