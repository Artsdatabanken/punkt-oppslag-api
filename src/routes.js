module.exports = function(app, index) {
  app.get("/:x,:y", (req, res, next) => {
    index
      .get(req.params.x, req.params.y)
      .then(node => {
        if (!node) return next();
        node = collapse(node);
        const r = {
          fylke: "Telemark",
          kommune: "Tinn",
          miljø: {}
        };
        Object.keys(node).forEach(key => {
          const o = { ...node[key], ...index.config.meta[key] };

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
