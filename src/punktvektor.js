const fetch = require('node-fetch')

const mergeKeys = (target, source) => {
    Object.keys(source).forEach(key =>
        target[key] = source[key])
}

const leggTilNaturtypeMeta = (kl, index) => {
    var meta = index.hentMeta(kl.kartleggingsenhetkode)
    mergeKeys(kl, meta)
    for (var v of (kl.variabler || [])) {
        meta = index.hentMeta(v.variabelkode)
        mergeKeys(v, meta)
    }
}

async function query(lng, lat, index) {
    try {
        // TODO: Test/prod switch
        const url = `https://forvaltningsportalapi.test.artsdatabanken.no/rpc/punkt?lat=${lat}&lng=${lng}`
        const res = await fetch(url)
        const json = await res.json()
        json.forEach(e => {
            if (e.data.kartleggingsenhet) {
                for (var kl of e.data.kartleggingsenhet)
                    leggTilNaturtypeMeta(kl, index)
            }
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
        return { error: error.message }
    }
}


module.exports = { query }
