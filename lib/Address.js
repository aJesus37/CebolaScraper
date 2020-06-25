const uuid = require('uuid').v4

class address {
    constructor(statusCode = 0, host = null, lastUpdate = null, firstSeen = new Date(), status = null, banned = "false", lastOnline = null, responseUrl = null, title = null, byteSize = 0, references = [null], categories = [null], redirects = [null]) {
        this.statusCode = statusCode
        this.host = host
        this.lastUpdate = lastUpdate
        this.firstSeen = firstSeen
        this.status = status
        this.banned = banned
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