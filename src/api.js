// set up express for the http api
const program = require("./opts.js");
const Log = require("./schema.js");
const express = require("express");
const cors = require("cors");
const stats = require("./stats.js");
const basicAuth = require("express-basic-auth");
const moment = require('moment');
const app = express();
app.use(cors());
app.use(express.json());

if (program.debug || program.apiDebug) {
  const morgan = require("morgan");
  app.use(morgan("combined"));
}

checkApiKey = function(req, res, next) {
  if (!req.headers["x-auth"] || req.headers["x-auth"] !== program.apiKey) {
    res.status(401);
    res.end();
    return;
  }
  next();
};

app.get("/", checkApiKey, (req, res) => res.send(""));
app.get("/search", checkApiKey, (req, res) => {
  const pageNumber = req.query.page ? req.query.page : 1;
  const r = new RegExp(decodeURIComponent(req.query.q));
  const query = { combined_message: { $regex: r, $options: "i" } };
  if (req.query.username) {
    query["username"] = {
      $regex: new RegExp(decodeURIComponent(req.query.username)),
      $options: "i"
    };
  }
  if (req.query.computername) {
    query["computername"] = {
      $regex: new RegExp(decodeURIComponent(req.query.computername)),
      $options: "i"
    };
  }
  if (req.query.mac) {
    query["MAC"] = {
      $regex: new RegExp(decodeURIComponent(req.query.mac)),
      $options: "i"
    };
  }
  if (req.query.ip) {
    query["IP"] = {
      $regex: new RegExp(decodeURIComponent(req.query.ip)),
      $options: "i"
    };
  }
  Log.paginate(
    query,
    {
      page: pageNumber,
      limit: program.maxApiResults,
      sort: { created_at: "desc" }
    },
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500);
        res.send(err);
        return;
      }
      res.send(results);
    }
  );
});

app.post('/log', checkApiKey, (req, res) => {
  let logEntry = new Log({
    action: req.body.action,
    datetime: moment.utc(req.body.datetime, 'DD/MM/YYYY HH:mm:ss'),
    username: req.body.username,
    domain: req.body.domain,
    computername: req.body.computername,
    MiscData: req.body.MiscData,
    data: req.body.data,
    MAC: req.body.MAC,
    IP: req.body.IP,
    OS: req.body.OS,
    SessionType: req.body.SessionType,
    combined_message: `${req.body.action} ${req.body.username} ${req.body.domain} ${req.body.computername} ${req.body.MiscData} ${req.body.MAC} ${req.body.IP} ${req.body.OS} ${req.body.SessionType}`
  });
  logEntry.save().then(() => {
    if (program.debug) {
      console.log(`Saved: ${logEntry}`);
    }
  });
  // if (!program.disableMetrics) {
  //   stats.totalLogs.inc();
  //   stats.hostGauge.inc({ host: logEntry.host });
  //   stats.containerGauge.inc({ container: logEntry.tags._container_name });
  //   stats.imageGauge.inc({ image: logEntry.tags._image_name }, 1);
  // }
  res.status(201).send({message: 'done'});
});

app.get("/_healthz", (req, res) => {
  res.send("OK");
});
if (!program.disableMetrics) {
  if (program.promUser) {
    const users = {};
    users[program.promUser] = program.promPass;
    app.get("/metrics", basicAuth({ users: users }), (req, res) => {
      res.set("Content-Type", stats.client.register.contentType);
      res.end(stats.client.register.metrics());
    });
  } else {
    app.get("/metrics", (req, res) => {
      res.set("Content-Type", stats.client.register.contentType);
      res.end(stats.client.register.metrics());
    });
  }
}

module.exports = app;
