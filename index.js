#!/usr/bin/env node
//const axios = require('axios').default;
const psl = require('psl')
const cheerio = require('cheerio')
const fs = require('fs');
const got = require('got')
const Address = require('./lib/Address')

//Variável vai ser passada via argumento com valor default
const threads = 1;
const MS_A_DAY = 86400 * 1000;
const DAYS_AFTER_TO_TRY = 0;
let promises = 0
//Conteudo vai ser adquirido via argumento ou arquivo
let urls = []
let urls_to_parse = ['http://xmh57jrzrnw6insl.onion/', '233lidifqbunokht.onion', 'http://hss3uro2hsxfogfq.onion/', '3poyacgmogsw7kyf.onion', 'http://msydqstlz2kzerdg.onion/', 'http://gjobqjj7wyczbqie.onion/']
//let urls_to_parse = fs.readFileSync('./onion_list.txt').toString().split('\n');

for (url of urls_to_parse) {
    let parsed_url = psl.get(url.replace(/^.*:\/\//, "")
        .replace(/\.onion.*$/, '\.onion'))
    if (parsed_url !== null) {
        //console.log(`The url ${parsed_url} is ok`)
        urls.push(parsed_url)
    }
}
//console.log(`Urls are: ${urls}\n\n`)
let results = []
let datetimes = []
let errors = []
let anyTest = false
let offline_urls = []
let request_options = {
    timeout: 15000,
    retry: 0,
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0' // Tor's User-Agent
    }
}
//var done = (function wait() { if (!done) setTimeout(wait, 1000) })();

const makeRequest = async () => {
    if (urls.length == 0) {
        console.debug("No urls to test, probably waiting for promises: " + promises)
        setTimeout(controller, 1000);
        return 0;
    }
    if (!urls.length == 0) {
        for (url of urls) {
            console.log(`Making request for URL ${url}`)
            //axios.get('http://'+url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0', timeout: axios_timeout || 15000 } })
            got('http://' + url, request_options)
                .then((response) => {
                    anyTest = true
                    console.log("Got one response")
                    results.push(response);
                    datetimes.push(new Date())
                    promises--;
                    if (offline_urls.indexOf(url) !== -1) {
                        offline_urls.splice(offline_urls.indexOf(url), 1)
                    }
                    controller()
                })
                .catch((error) => {
                    anyTest = true
                    console.log("Got one error")
                    errors.push(error);
                    promises--;
                    controller()
                })
            urls.splice(urls.indexOf(url), 1)
            promises++;
            if (promises >= threads) {
                break;
            }
        }
    }
}

const controller = async () => {
    if (urls.length == 0 && promises == 0) {
        if (anyTest){
            let final_counter = 0
        let the_objects = []
        console.debug("Got all responses, showing results or errors")
        console.dir(`results is: ${results}`, { depth: null })
        console.debug(`Error is: ${errors}`)
        console.debug("Setting up final results JSON")

        for (value of results) {
            let body = cheerio.load(value.body)
            let final_objects = new Address()
            final_objects.statusCode = value.statusCode
            final_objects.host = value.requestUrl
                .replace(/^http:\/\//, "")
                .replace(/\.onion.*$/, '\.onion')
            final_objects.responseUrl = value.url
            final_objects.title = (body("title")
                .text()
                .replace(/\n/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/(^\s)|(\s$)/g, ''))
            final_objects.lastUpdate = datetimes[final_counter]
            final_objects.lastOnline = final_objects.lastUpdate
            final_objects.byteSize = Buffer.byteLength(value.body, 'utf8')
            if (value.statusCode >= 200 && value.statusCode < 300){
                final_objects.status = 'online'
            } else if (value.statusCode >= 400){
                final_objects.status = 'offline'
            } else {
                final_objects.status = 'unknown'
            }
            the_objects.push(final_objects)
            final_counter++;
        }

        for (value of offline_urls) {
            the_objects.push(new Address(statusCode = 0, host = value, lastUpdate = (new Date())))
        }

        console.dir(the_objects)
        fs.writeFileSync('./results.txt', JSON.stringify(the_objects, null, 2))
        process.exit(0)
        } else {
            console.log("All links have been tested less than " + DAYS_AFTER_TO_TRY + " days ago. Nothing to do.")
        }


    } else if (urls.length == 0) {
        console.debug("Urls are empty, calling controller in 1s")
        setTimeout(controller, 1000);

    } else {
        console.debug("URLs not empty, calling request")
        setTimeout(makeRequest, 100);
    }
}

const checkList = () => {
    let List = []
    try {
        List = JSON.parse(fs.readFileSync('./results.txt'))
    } catch {
        console.log("There is no result to filter")
    }
    for (obj of List) {
        console.debug("Check if new list has links contained in teste list. Actual: " + obj.host)
        console.log(urls.includes(obj.host))
        if (urls.includes(obj.host)) {
            console.debug("List has link. Checking if last test if older than " + DAYS_AFTER_TO_TRY + "days old.")
            let test_days_old = (new Date() - new Date(obj.lastUpdate)) / MS_A_DAY
            console.log(`Last test is ${test_days_old} days old`)
            if (test_days_old < DAYS_AFTER_TO_TRY) {
                urls.splice(urls.indexOf(obj.host), 1)
                console.debug("Link was tested less than " + DAYS_AFTER_TO_TRY + " ago, removing from list")
            }
        }
    }
    offline_urls = urls.slice()
}

checkList()
makeRequest()