const proj4 = require("proj4");

var firstProjection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
var secondProjection = "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs";

function reproject(x, y) {
  const p = proj4(firstProjection, secondProjection, [
    parseFloat(x),
    parseFloat(y)
  ]);
  return p;
}

module.exports = { reproject };
