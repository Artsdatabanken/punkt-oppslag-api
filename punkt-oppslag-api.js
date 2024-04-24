import path from "path";
import express from "express";
import log from "log-less-fancy";
import minimist from "minimist";
import pjson from "./package.json" with {type: "json"};
import swagger from "./src/swagger.js";
import Index from "./src/index.js";
import routes from "./src/routes.js";

var argv = minimist(process.argv.slice(2), { alias: { p: "port" } });
if (argv._.length !== 1) {
  console.log("Usage: node punkt-oppslag-api.js [options] [rootDirectory]");
  console.log("");
  console.log("rootDirectory    Data directory containing index.sqlite");
  console.log("");
  console.log("Options:");
  console.log("   -p PORT --port PORT       Set the HTTP port [8000]");
  console.log("");
  console.log("A root directory is required.");
  process.exit(1);
}

const app = express();

app.use(function (req, res, next) {
  res.header("X-Powered-By", "Punkt-oppslag v" + pjson.version);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With"
  );
  if (req.method === "OPTIONS") {
    return res.send(200);
  } else {
    return next();
  }
});

const port = argv.port || 8000;
const index = new Index();
index.rootDirectory = path.resolve(argv._[0] || ".");
index.load();

routes(app, index);
swagger.init(app);

app.listen(port, () => {
  log.info("Server root directory " + index.rootDirectory);
  log.info("Server listening on port " + port);
});
