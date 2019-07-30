module.exports = function(app, index) {
  app.get("/:x,:y", (req, res, next) => {
    index
      .get(req.params.x, req.params.y)
      .then(node => {
        node = collapse(node);
        const r = {};
        Object.keys(node).forEach(key => {
          r[key] = { ...node[key], ...index.config.meta[key] };
        });
        if (!node) return next();
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
