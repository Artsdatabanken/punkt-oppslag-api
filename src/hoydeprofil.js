const fetch = require('node-fetch')

const gpxTemplate = `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<gpx version="1.1"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://www.topografix.com/GPX/1/1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
    <trk>
        <trkseg>
            %TRKPT%
        </trkseg>
    </trk>
</gpx>  `

async function diagram(points) {
    try {
        const callbackUrl = "http://punkt.test.artsdatabanken.no/v1/gpx?punkter=" + points
        const url = "http://openwps.statkart.no/skwms1/wps.elevation2?request=Execute&service=WPS&version=1.0.0&identifier=elevationChart&datainputs=gpx=@xlink:href=" + callbackUrl
        const res = await fetch(url)
        const xml = await res.text()
        const error = xml.match(/ExceptionText>(?<msg>.*?)\</)
        if (error) return { error: error.groups.msg }
        const imgUrl = xml.match(/image\/png\">(?<img>.*?)\</).groups.img
        return { image: imgUrl }
    }
    catch (error) {
        return { error: error }
    }
}

async function json(points) {
    try {
        const callbackUrl = "http://punkt.test.artsdatabanken.no/v1/gpx?punkter=" + points
        //const callbackUrl = "http://punkt.test.artsdatabanken.no/gpx.xml"
        const url = "http://openwps.statkart.no/skwms1/wps.elevation2?request=Execute&service=WPS&version=1.0.0&identifier=elevationJSON&datainputs=gpx=@xlink:href=" + callbackUrl
        const res = await fetch(url)
        const xml = await res.text()
        const error = xml.match(/ExceptionText>(?<msg>.*?)\</)
        if (error) return { error: error.groups.msg }
        const jsonString = xml.match(/application\/json\">(?<img>.*?)\</).groups.img
        return jsonString
    }
    catch (error) {
        return { error: error }
    }
}

async function gpx(pointstring) {
    const points = pointstring.split(',')
    var trkpts = ''
    for (var i = 0; i < points.length - 1; i += 2) {
        const lat = points[i]
        const lon = points[i + 1]
        const trkpt = `            <trkpt lat="${lat}" lon="${lon}"></trkpt>
`
        trkpts += trkpt
    }
    const gpx = gpxTemplate.replace('%TRKPT%', trkpts)
    return gpx
}

module.exports = { diagram, json, gpx }
