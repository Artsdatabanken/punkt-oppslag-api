import log from "log-less-fancy";
import path from "path";
import sqlite3 from "sqlite3";
import reproject from "./reproject.js";
import fs from "fs";

class Index {
  normalize(coord, bounds) {
    return [
      (coord[0] - bounds.left) / bounds.width,
      (coord[1] - bounds.bottom) / bounds.height
    ];
  }

  hackTempKode(kode) {
    if (!kode) return ''
    kode = kode.replace("AO-", "AO-TO-FL-"); // TEMP HACK
    kode = kode.replace('_', '-')
    return kode
  }

  hentMetaFraAltKode(altkode) {
    const kode = this.config.altkode2kode[altkode]
    return this.hentMeta(kode)
  }

  hentMeta(kode) {
    kode = this.hackTempKode(kode);
    const o = this.config.meta[kode];
    if (!o) return { kode: kode, melding: "Metadata mangler" };
    //    delete o.kart;
    delete o.autorkode;
    delete o.geografi;
    delete o.lenke;
    delete o.mediakilde;
    delete o.stats;
    //delete o.overordnet;
    delete o.pred_lnr;
    delete o.osm;
    //    delete o.bbox;
    if (kode.indexOf("NN-LA-TI") !== 0) delete o.gradient;
    //delete o.type;
    //delete o.flagg;
    //    delete o.farge;
    //delete o.nivå;
    delete o.undernivå;
    delete o.datakilde;
    o.kart = { målestokk: o.kart.målestokk, presisjon: o.kart.presisjon };
    return o;
  }

  async get(latX, latY) {
    let utmcoord = reproject(latX, latY);
    let coord = this.normalize(utmcoord, this.config.bounds);
    let x = coord[0];
    let y = coord[1];
    let key = "";
    const r = {
      utm: { latX, latY, utmcoord, coord, bounds: this.config.bounds }
    };
    let z = 0;
    while (z <= this.config.maxzoom) {
      const tile = await this.getTile(key);
      if (tile) {
        r[z] = JSON.parse(tile.tile_data);
        r[z].key = key;
      }
      key += (x > 0.5 ? 1 : 0) + (y > 0.5 ? 2 : 0);
      x = 2 * (x % 0.5);
      y = 2 * (y % 0.5);
      z++;
    }
    return r;
  }

  async getTile(key) {
    log().debug(`Read tile ${key}`);
    const sql = "SELECT tile_data FROM tiles WHERE key=?";
    return await this.readdb(sql, [key]);
  }

  async readdb(sql, args = []) {
    log().debug("SQL   : " + sql);
    return new Promise((resolve, reject) => {
      this.db.get(sql, args, (err, row) => {
        if (err) return reject(err);
        return resolve(row);
      });
    });
  }

  load() {
    const data = fs.readFileSync(path.join(this.rootDirectory, "config.json"));
    let config = JSON.parse(data);
    config.bounds.width = config.bounds.right - config.bounds.left;
    config.bounds.height = config.bounds.top - config.bounds.bottom;
    config.maxzoom = 10;
    Object.values(config.layers).forEach(
      layer => (config.maxzoom = Math.max(config.maxzoom, layer.zoom))
    );
    this.config = config;
    const buildpath = path.join(this.rootDirectory, config.buildPath);
    this.db = this.openDatabase(buildpath);

    this.loadMeta(buildpath);
  }

  loadMeta(buildpath) {
    const metabase = this.readJson(buildpath, "metabase.json");
    if (!metabase.items) throw new Error("Finner ikke items i metabase.");
    this.config.meta = {};
    this.config.altkode2kode = {};
    metabase.items.forEach(e => (this.config.meta[e.kode] = e));
    metabase.items.forEach(e => { if (e.altkode) (this.config.altkode2kode[e.altkode] = e.kode) });
    const la = this.readJson(buildpath, "la_index.json");
    // Swap key & value
    this.config.la_index = Object.entries(la).reduce((acc, v) => {
      acc[v[1]] = v[0];
      return acc;
    }, {});
  }

  readJson(directory, filename) {
    const data = fs.readFileSync(path.join(directory, filename));
    return JSON.parse(data);
  }

  openDatabase(buildPath) {
    const sqlitePath = path.join(buildPath, "index.sqlite");
    log().info("Reading tiles from " + sqlitePath);
    return new sqlite3.Database(sqlitePath, sqlite3.OPEN_READ, err => {
      if (err) throw new Error(err);
    });
  }
}

//module.exports = Index;
export default Index;