const AWS = require("aws-sdk");

AWS.config.update({
  region: "usa-east-1",
  endpoint: "http://127.0.0.1:8000",
});

const dynamodb = new AWS.DynamoDB();

const params = {
  TableName: "onionLinks",
  AttributeDefinitions: [
    { AttributeName: "banned", AttributeType: "S" },
    { AttributeName: "host", AttributeType: "S" },
    { AttributeName: "id", AttributeType: "S" },
  ],
  KeySchema: [
    { AttributeName: "id", KeyType: "HASH" }, // Partition key
    { AttributeName: "host", KeyType: "RANGE" }, // Sort key
  ],
  LocalSecondaryIndexes: [
    {
      IndexName: "onionLinksSearch",
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH" }, // Partition key
        { AttributeName: "banned", KeyType: "RANGE" }, // Sort Key
      ],
      Projection: {
        ProjectionType: "ALL",
      },
    },
  ],
  ProvisionedThroughput: {
    ////////////////////////////// REMOVE
    ReadCapacityUnits: 10, ////////////////////////// IN
    WriteCapacityUnits: 10, ////////////////////// PRODUCTION
  },
};

dynamodb.createTable(params, (err, data) => {
  if (err) {
    console.error(
      "Unable to create table. Error JSON: ",
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log(
      "Created table. Table description JSON: ",
      JSON.stringify(data, null, 2)
    );
  }
});
