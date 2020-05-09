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

const make_request = async () => {
    if (urls.length == 0) {
        console.debug("No urls to test, probably waiting for promises: " + promises)
        setTimeout(controller, 1000);
        return 0;
    }
    if (!urls.length == 0) {
        for (url of urls) {
            console.log(`Making request for URL ${url}`)
            axios.get('http://'+url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0', timeout: axios_timeout || 15000 } })
                .then((response) => {
                    console.log("Got one response")
                    results.push(response);
                    promises--;
                    controller()
                })
                .catch((error) => {
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
        
        let final_counter = 0
        let the_objects = []
        console.debug("Got all responses, showing results or errors")
        console.dir(`results is: ${results}`, { depth: null })
        console.debug(`Error is: ${errors}`)

        for (value of results){
            let final_objects = {}
            let body = cheerio.load(value.data)
            final_objects = {}
            final_objects.status = value.status
            final_objects.host = value.config.url
            final_objects.title = (body("title").text().replace(/\n/g,'').replace(/\s{2,}/g,' ').replace(/(^\s)|(\s$)/g,''))
            final_objects.lastUpdate = new Date();
            final_objects.references = [null]
            the_objects.push(final_objects)
            final_counter++;
        }

        console.dir(the_objects)
        process.exit(0)

    } else if (urls.length == 0) {
        console.debug("Urls are empty, calling controller in 1s")
        setTimeout(controller, 1000);

    } else {
        console.debug("URLs not empty, calling request")
        setTimeout(make_request, 100);
    }
}

make_request()