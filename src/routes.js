module.exports = function(app, index) {
  app.get("/raw/:x,:y", (req, res, next) => {
    index
      .get(req.params.x, req.params.y)
      .then(node => {
        if (!node) return next();
        res.setHeader("Content-Type", "application/json");
        res.send(node);
      })
      .catch(err => {
        next(err);
      });
  });
};
  app.get("/:x,:y", (req, res, next) => {
    index
      .get(req.params.x, req.params.y)
      .then(node => {
        if (!node) return next();
        node = collapse(node);
        const r = {
          fylke: "Telemark",
          kommune: "Tinn",
          sted: {
            navn: "Rjukanfossen",
            kategori: ["ferskvann", "rennendeVann", "foss"]
          },
          miljø: {}
        };
        Object.keys(node).forEach(key => {
          const o = { ...node[key], ...index.config.meta[key] };
          delete o.kart;
          delete o.bbox;
          r.miljø[key] = o;
        });

        res.setHeader("Content-Type", "application/json");
        res.send(r);
      })
      .catch(err => {
        next(err);
      });
  });
};

function collapse(node) {
  let r = {};
  Object.keys(node).map(key => {
    r = Object.assign(r, node[key]);
  });
  return r;
}
