module.exports = function(app, index) {
  app.get("/", (req, res, nest) => {
    res.send(
      'Query API for geographic points<p>Example: <a href="/10,63">punkt/10,63</a>'
    );
  });
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

  // Fetch tile from database using the quadtile key
  // example /0323
  app.get("/:quadkey", (req, res, next) => {
    index.getTile(req.params.quadkey).then(node => {
      if (!node) return next();
      res.setHeader("Content-Type", "application/json");
      res.send(node.tile_data);
    });
  });

  app.get("/:x,:y", (req, res, next) => {
    index
      .get(req.params.x, req.params.y)
      .then(node => {
        if (!node) return next();
        delete node.utm;
        node = collapse(node);
        const r = {
          environment: {}
        };
        Object.keys(node).forEach(key => {
          let stats = node[key];
          if (typeof stats === "number") stats = { v: stats };
          if ("S3-".indexOf(key) >= 0) return;
          const o = { ...stats, ...index.hentMeta(key) };
          aktiver(o.barn, o.v);
          if (key === "NN-LA-TI") {
            const laindex = o.v;
            if (laindex) {
              const kode = index.config.la_index[laindex];
              if (kode) r.landskap = index.hentMeta(kode);
            }
          } else if (key !== "AO") {
            r.environment[key] = o;
          }
        });
        if (node.AO) {
          let knr = node.AO.toString();
          knr = knr.length < 4 ? "0" + knr : knr;
          r.kommune = index.hentMeta(
            `AO-${knr.substring(0, 2)}-${knr.substring(2, 4)}`
          );
          r.fylke = index.hentMeta(`AO-${knr.substring(0, 2)}`);
          if (r.fylke) delete r.fylke.barn;
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
  delete r.key;
  return r;
}

function aktiver(barn, verdi) {
  if (!barn) return;
  barn.forEach(b => {
    if (b.intervall) {
      const { min, max } = b.intervall;
      b.aktiv = min <= verdi && max >= verdi;
    }
    //    delete b.normalisertVerdi;
    //    delete b.farge;
    b.bilde = b.url + "/foto_408.jpg";
  });
}
