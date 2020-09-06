const fetch = require('node-fetch')

const mergeKeys = (target, source) => {
    Object.keys(source).forEach(key =>
        target[key] = source[key])
}

async function query(lng, lat, index) {
    try {
        // TODO: Test/prod switch
        const url = `https://forvaltningsportalapi.test.artsdatabanken.no/rpc/punkt?lat=${lat}&lng=${lng}`
        const res = await fetch(url)
        const json = await res.json()
        json.forEach(e => {
            if (e.id) {
                const meta = index.hentMeta(e.id)
                mergeKeys(e, meta)
            }
            else {
                if (!e.data) return
                const data = e.data
                if (data.type) e.type = data.type.map(kode => index.hentMetaFraAltKode(kode))
                if (data.variabel) e.variabel = data.variabel.map(kode => index.hentMetaFraAltKode(kode))
            }
        })
        return json
    }
    catch (error) {
        return { error: error }
    }
}


module.exports = { query }
