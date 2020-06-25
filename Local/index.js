const AWS = require("aws-sdk");
const scan = require('./ScanAll')
const put = require('./AddItem')
const Address = require('../lib/Address')
const cheerio = require('cheerio')
const psl = require('psl');
const got = require('got')

let testData = [
  {
    "statusCode": 200,
    "host": "uol.com.br",
    "lastUpdate": "2020-06-13T14:47:38.865Z",
    "firstSeen": "2020-06-13T14:47:44.432Z",
    "status": "offline",
    "banned": "false",
    "lastOnline": "2020-06-13T14:47:38.865Z",
    "responseUrl": "https://www.uol.com.br/",
    "title": "UOL - O melhor conteúdoStartNossaTABUniversaVivaBemMovMovEcoaTilt",
    "byteSize": 418259,
    "references": [
      null
    ],
    "categories": [
      null
    ],
    "redirects": [
      null
    ],
    "id": "92caa230-6ee0-4ba3-b9d4-090bc14abbec"
  },
  {
    "statusCode": 200,
    "host": "g1.com.br",
    "lastUpdate": "2020-06-13T14:47:39.150Z",
    "firstSeen": "2020-06-13T14:47:44.612Z",
    "status": "online",
    "banned": "false",
    "lastOnline": "2020-06-13T14:47:39.150Z",
    "responseUrl": "https://g1.globo.com/",
    "title": "G1 - O portal de notícias da GloboG1G1",
    "byteSize": 726735,
    "references": [
      null
    ],
    "categories": [
      null
    ],
    "redirects": [
      null
    ],
    "id": "4825b81e-22ef-45e4-9162-eb97b5565064"
  },
  {
    "statusCode": 200,
    "host": "msn.com.br",
    "lastUpdate": "2020-06-13T14:47:40.121Z",
    "firstSeen": "2020-06-13T14:47:44.696Z",
    "status": "online",
    "banned": "false",
    "lastOnline": "2020-06-13T14:47:40.121Z",
    "responseUrl": "https://www.msn.com/pt-br",
    "title": "MSN | Hotmail, Notícias, Famosos, Clima, Horóscopo, Outlook",
    "byteSize": 412437,
    "references": [
      null
    ],
    "categories": [
      null
    ],
    "redirects": [
      null
    ],
    "id": "c585d61b-8f9f-435e-adbb-5a0a69da9ff3"
  },
  {
    "statusCode": 200,
    "host": "thehackernews.com",
    "lastUpdate": "2020-06-13T14:47:40.690Z",
    "firstSeen": "2020-06-13T14:47:44.725Z",
    "status": "online",
    "banned": "false",
    "lastOnline": "2020-06-13T14:47:40.690Z",
    "responseUrl": "https://thehackernews.com/",
    "title": "The Hacker News - Cybersecurity News and Analysis",
    "byteSize": 113060,
    "references": [
      null
    ],
    "categories": [
      null
    ],
    "redirects": [
      null
    ],
    "id": "33caf78b-07a3-4786-8a52-4c168fa7b9fb"
  },
  {
    "statusCode": 200,
    "host": "hackingarticles.in",
    "lastUpdate": "2020-06-13T14:47:44.263Z",
    "firstSeen": "2020-06-13T14:47:44.776Z",
    "status": "online",
    "banned": "false",
    "lastOnline": "2020-06-13T14:47:44.263Z",
    "responseUrl": "https://www.hackingarticles.in/",
    "title": "Hacking Articles - Raj Chandel's Blog",
    "byteSize": 188475,
    "references": [
      null
    ],
    "categories": [
      null
    ],
    "redirects": [
      null
    ],
    "id": "1ec0b4f5-6437-4293-baad-d3fa54ba568b"
  }
]

const unmarshall = (list) => {
  return new Promise((resolve, reject) => {
    let unmarshalled = [];
    try {
      for (value of list) {
        unmarshalled.push(AWS.DynamoDB.Converter.unmarshall(value));
      }
      resolve(unmarshalled);
    } catch (e) {
      reject(e);
    }
  });
};

const getHostList = async (callback) => {
  let marshalled = await scan.scanAll();
  let unmarshalled = await unmarshall(marshalled.Items);
  return unmarshalled
};

const addItem = async () => {
  await put.addItem(testData)
}

//addItem()
//getHostList();

const updateExistingItem = (oldItem, newItem) => {
  new Promise((resolve, reject) => {
    oldItem.statusCode = newItem.statusCode;
    if (newItem.statusCode >= 200 && newItem.statusCode < 300) {
      let body = cheerio.load(newItem.body);
      oldItem.status = "online";
      oldItem.lastOnline = new Date().toString();
      oldItem.lastUpdate = oldItem.lastOnline
      oldItem.responseUrl = newItem.url;
      oldItem.title = body("title")
        .text()
        .replace(/\n/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/(^\s)|(\s$)/g, "") || oldItem.title
      oldItem.byteSize = Buffer.byteLength(newItem.body, 'utf8')
    } else if (newItem.statusCode >= 400) {
      oldItem.lastUpdate = new Date().toString();
      oldItem.status = "unknown";
    } else {
      oldItem.lastUpdate = new Date().toString();
      oldItem.status = "offline";
    }
  });
};


///////////// Host test function
const testExistingHostStatus = async () => {
  const initialList = await getHostList()
  for (host of initialList){
    await got('http://'+host.host)
      .then((result) => {
        updateExistingItem(host,result)
        put.addItem(host)
      })
      .catch((err)=>{
        console.log("Error: " + err)
        updateExistingItem(host, new Address())
        put.addItem(host)
      })
  }
}

testExistingHostStatus()
//////////////////////////////////////////