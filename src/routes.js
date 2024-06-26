import hoydeprofil from './hoydeprofil.js';
import punktvektor from './punktvektor.js';

//module.exports = function (app, index) {
export default function (app, index) {
  // Konverterer query argument med punkter til GPX track XML
  // Brukes for å kalle https://www.kartverket.no/data/Hoydeprofil/
  app.get("/v1/gpx", (req, res, next) => {
    hoydeprofil.gpx(req.query.punkter).then(result => {
      res.setHeader("Content-Type", "application/gpx+xml");
      res.send(result);
    })
      .catch(err => {
        next(err);
      });
  })

  app.get("/v1/punktvektor", (req, res, next) => {
    punktvektor.query(req.query.lng, req.query.lat, index).then(result => {
      res.setHeader("Content-Type", "application/json");
      res.send(result)
    })
      .catch(err => {
        next(err);
      });
  })

  app.get("/v1/hoydeprofil/diagram", (req, res, next) => {
    hoydeprofil.diagram(req.query.punkter).then(result => {
      res.setHeader("Content-Type", "application/json");
      res.send(result)
    })
      .catch(err => {
        next(err);
      });
  })

  app.get("/v1/hoydeprofil/json", (req, res, next) => {
    hoydeprofil.json(req.query.punkter).then(result => {
      res.setHeader("Content-Type", "application/json");
      res.send(result)
    })
      .catch(err => {
        next(err);
      });
  })

  app.get("/v1/raw", (req, res, next) => {
    index
      .get(req.query.lng, req.query.lat)
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
  app.get("/v1/quadtile/:quadkey", (req, res, next) => {
    index.getTile(req.params.quadkey).then(node => {
      if (!node) return next();
      res.setHeader("Content-Type", "application/json");
      res.send(node.tile_data);
    });
  });

  app.get("/v1/punkt", (req, res, next) => {
    index
      .get(req.query.lng, req.query.lat)
      .then(node => {
        if (!node) return next();
        delete node.utm;
        node = collapse(node);
        var r = {};
        Object.keys(node).forEach(key => {
          let stats = node[key];
          if (typeof stats === "number") stats = { v: stats };
          if ("S3-".indexOf(key) >= 0) return;
          const o = { ...stats, ...index.hentMeta(key) };
          aktiver(o, o.v);
          if (key === "NN-LA-TI") {
            const laindex = o.v;
            if (laindex) {
              const kode = index.config.la_index[laindex];
              if (kode) r.landskap = index.hentMeta(kode);
            }
          } else if (key !== "AO") {
            r[key] = o;
          }
        });
        mapFylkeOgKommune(index, node, r)

        if (req.query.layer)
          r = r[req.query.layer] || {}

        res.setHeader("Content-Type", "application/json");
        res.send(r);
      })
      .catch(err => {
        next(err);
      });
  });
};

function mapFylkeOgKommune(index, node, r) {
  if (!node.AO) return
  let knr = node.AO.toString();
  knr = knr.length < 4 ? "0" + knr : knr;
  r.kommune = index.hentMeta(
    `AO-${knr.substring(0, 2)}-${knr.substring(2, 4)}`
  );
  r.fylke = index.hentMeta(`AO-${knr.substring(0, 2)}`);
  if (r.fylke) delete r.fylke.barn;
}

function collapse(node) {
  let r = {};
  Object.keys(node).map(key => {
    r = Object.assign(r, node[key]);
  });
  delete r.key;
  return r;
}

function aktiver(o, verdi) {
  const barn = o.barn
  if (!barn) return;
  barn.forEach(b => {
    if (b.intervall) {
      const { min, max } = b.intervall;
      b.aktiv = min <= verdi && max >= verdi;
      if (b.aktiv) {
        o.tittel = b.tittel
        o.underkode = b.kode
      }
    }
    b.bilde = b.url + "/foto_408.jpg";
  });
}