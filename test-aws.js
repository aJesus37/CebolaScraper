const AWS = require('aws-sdk')
const fs = require('fs')

AWS.config.update({
    region: "usa-east-1",
    endpoint: "http://127.0.0.1:8000"
  });
////////////////// Create Table in DynamoDB  
//const dynamodb = new AWS.DynamoDB();

//   const params = {
//       TableName : "onionLinks",
//       KeySchema: [
//           { AttributeName: "id", KeyType: "HASH" } //Partition key
//       ],
//       AttributeDefinitions: [
//         { AttributeName: "id", AttributeType: "S" }
//       ],
//       ProvisionedThroughput: {
//           ReadCapacityUnits: 10,
//           WriteCapacityUnits: 10
//       }
//   }

//   dynamodb.createTable(params, (err, data) => {
//       if (err){
//           console.error("Unable to create table. Error JSON: ", JSON.stringify(err, null, 2))
//       } else {
//           console.log("Created table. Table description JSON: ", JSON.stringify(data, null, 2))
//       }
// })
/////////////////////////////////////////////////////////////////////////////////////////

////////////////// Put Items in DynamoDB
// const docClient = new AWS.DynamoDB.DocumentClient()

// const Links = JSON.parse(fs.readFileSync('/home/node/CebolaScraper/results.txt', 'utf8'))

// Links.forEach((link) => {
//     let params = {
//         TableName: "onionLinks",
//         Item: {
//             "status": link.status,
//             "host": link.host,
//             "lastUpdate": link.lastUpdate,
//             "lastOnline": link.lastUpdate,
//             "responseUrl": link.responseUrl,
//             "title": link.title,
//             "byteSize": link.byteSize,
//             "references": link.references,
//             "categories": link.categories,
//             "redirects": link.redirects,
//             "id": link.id
//         }
//     }
//     docClient.put(params, (err, data) => {
//         if (err){
//             console.error("Unable to add link", link.title, ". Error JSON:", JSON.stringify(err, null, 2));
//         } else {
//             console.log("PutItem succeeded:", link.title);
//         }
//     })
// })
////////////////////////////////////////////////////////////////////

/////////////////////////// Read Item
const docClient = new AWS.DynamoDB.DocumentClient()

let table = "onionLinks"
let id = '1cdbdfb8-57bb-4113-9c9f-bad5332ff0be'

let params = {
    TableName: table,
    Key: {
        "id" : id
    }
}

docClient.get(params, (err, data) => {
    if (err){
        console.error("Unable to read Item. Error JSON: ", JSON.stringify(err, null, 2))
    } else {
        console.log("GetItem Succeeded: ", JSON.stringify(data, null, 2))
    }
})