const { reproject } = require("./reproject");

async function get(x, y) {
  const coord = reproject(x, y);
  return { x, y, z: coord };
}

module.exports = { get };
