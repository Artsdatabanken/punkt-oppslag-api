const log = require("log-less-fancy")();
const path = require("path");
const sqlite3 = require("sqlite3");
const { reproject } = require("./reproject");
const fs = require("fs");

class Index {
  normalize(coord, bounds) {
    return [
      (coord[0] - bounds.left) / bounds.width,
      (coord[1] - bounds.bottom) / bounds.height
    ];
  }

  async get(x, y) {
    let coord = reproject(x, y);
    coord = this.normalize(coord, this.config.bounds);
    let key = "";
    const r = {};
    let z = 0;
    while (true) {
      const tile = await this.getTile(key);
      if (!tile) return r;
      r[z] = JSON.parse(tile.tile_data);
      key += x > 0.5 ? 1 : 0 + y > 0.5 ? 2 : 0;
      x = 2 * (x % 0.5);
      y = 2 * (y % 0.5);
      z++;
    }
  }

  async getTile(key) {
    log.debug(`Read tile ${key}`);
    const sql = "SELECT tile_data FROM tiles WHERE key=?";
    return await this.readdb(sql, [key]);
  }

  async readdb(sql, args = []) {
    log.debug("SQL   : " + sql);
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
    this.config = config;
    const buildpath = path.join(this.rootDirectory, config.buildPath);
    this.db = this.openDatabase(buildpath);

    this.loadMeta(buildpath);
  }

  loadMeta(buildpath) {
    const data = fs.readFileSync(path.join(buildpath, "metabase.json"));
    this.config.meta = JSON.parse(data);
  }

  openDatabase(buildPath) {
    const sqlitePath = path.join(buildPath, "index.sqlite");
    log.info("Reading tiles from " + sqlitePath);
    return new sqlite3.Database(sqlitePath, sqlite3.OPEN_READ, err => {
      if (err) throw new Error(err);
    });
  }
}

module.exports = Index;
