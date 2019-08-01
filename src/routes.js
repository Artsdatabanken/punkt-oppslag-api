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

  app.get("/:x,:y", (req, res, next) => {
    index
      .get(req.params.x, req.params.y)
      .then(node => {
        if (!node) return next();
        node = collapse(node);
        const r = {
          sted: {
            navn: "Rjukanfossen",
            kategori: ["ferskvann", "rennendeVann", "foss"]
          },
          environment: {}
        };
        Object.keys(node).forEach(key => {
          const o = { ...node[key], ...index.config.meta[key] };
          delete o.kart;
          delete o.bbox;
          delete o.gradient;
          delete o.type;
          delete o.flagg;
          delete o.farge;
          delete o.nivå;
          delete o.undernivå;
          delete o.datakilde;
          aktiver(o.barn, o.v);
          if (key !== "kommune") {
            key = key.replace("S3-", "S3"); // HACK
            r.environment[key] = o;
          }
        });
        if (node.kommune) {
          r.k = node.kommune;
          let knr = node.kommune.v.toString();
          knr = knr.length < 4 ? "0" + knr : knr;
          r.knr = knr;
          r.kommune =
            index.config.meta[
              `AO-${knr.substring(0, 2)}-${knr.substring(2, 4)}`
            ];
          r.fylke = index.config.meta[`AO-${knr.substring(0, 2)}`];
        }
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

function aktiver(barn, verdi) {
  if (!barn) return;
  barn.forEach(b => {
    const { min, max } = b.intervall;
    b.aktiv = min <= verdi && max >= verdi;
    delete b.normalisertVerdi;
    delete b.farge;
    b.bilde = b.url + "/foto_408.jpg";
  });
}
