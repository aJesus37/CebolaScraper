const uuid = require('uuid').v4

class address {
    constructor(statusCode = null, host = null, lastUpdate = null, status = null, lastOnline = null, responseUrl = null, title = null, byteSize = null, references = [null], categories = [null], redirects = [null]) {
        this.statusCode = statusCode
        this.host = host
        this.lastUpdate = lastUpdate
        this.status = status
        this.lastOnline = lastOnline
        this.responseUrl = responseUrl
        this.title = title
        this.byteSize = byteSize
        this.references = references
        this.categories = categories
        this.redirects = redirects
        this.id = uuid()
    }
}

module.exports = address