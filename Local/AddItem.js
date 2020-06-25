const AWSConfig = require("../conf/AWSConf");
const util = require('util')
const AWS = require("aws-sdk");

const region = AWSConfig.region;
const local = AWSConfig.local;

const addItem = (item) => {
  return new Promise((resolve, reject) => {
    // Create the DynamoDB Client with the region you want
    const dynamoDbClient = createDynamoDbClient(region);

    const PutItem = () => {
        // Create the input for putItem call
    const putItemInput = createPutItemInput();

    let actualItem = null

    // Call DynamoDB's putItem API
    executePutItem(dynamoDbClient, putItemInput).then(() => {
      console.info("PutItem API call has been executed.");
    });
    }


    if(!util.isArray(item)){
        actualItem = item;
        console.log("[+] Treating an Object")
        //console.log(JSON.stringify(actualItem, null, 2)) //DEBUG
        PutItem()
    } else if (util.isArray(item)){
        console.log("[+] Treating an Array") 
        for (actualItem of item){
            //console.log(actualItem) //DEBUG
            PutItem()
        }
    }

    function createDynamoDbClient(regionName) {
        if (local) {
            // Use the following config instead when using DynamoDB Local
            AWS.config.update({
              region: "localhost",
              endpoint: "http://localhost:8000",
              accessKeyId: "access_key_id",
              secretAccessKey: "secret_access_key",
            });
          } else {
            // Set the region
            AWS.config.update({ region: regionName });
          }

          return new AWS.DynamoDB();
    }

    function createPutItemInput() {
      return {
        TableName: "onionLinks",
        Item: {
          status: {
            S: actualItem.status || "unknown",
          },
          host: {
            S: actualItem.host,
          },
          statusCode: {
            N: (actualItem.statusCode || 0).toString(),
          },
          lastUpdate: {
            S: actualItem.lastUpdate || new Date().toString(),
          },
          firstSeen: {
            S: actualItem.firstSeen || new Date().toString(),
          },
          banned: {
            S: actualItem.banned || "false",
          },
          lastOnline: {
            S: actualItem.lastOnline || "never",
          },
          responseUrl: {
            S: actualItem.responseUrl || "none",
          },
          title: {
            S: actualItem.title || "none",
          },
          byteSize: {
            N: (actualItem.byteSize || 0).toString(),
          },
          references: {
            S: (actualItem.references || "none").toString(),
          },
          categories: {
            S: (actualItem.categories || "none").toString(),
          },
          redirects: {
            S: (actualItem.redirects || "none").toString() ,
          },
          id: {
            S: actualItem.id,
          },
        },
      };
    }

    async function executePutItem(dynamoDbClient, putItemInput) {
      // Call DynamoDB's putItem API
      try {
        const putItemOutput = await dynamoDbClient
          .putItem(putItemInput)
          .promise();
        console.info("Successfully put item.");
        // Handle putItemOutput
      } catch (err) {
        handlePutItemError(err);
      }
    }

    // Handles errors during PutItem execution. Use recommendations in error messages below to
    // add error handling specific to your application use-case.
    function handlePutItemError(err) {
      if (!err) {
        console.error("Encountered error object was empty");
        return;
      }
      if (!err.code) {
        console.error(
          `An exception occurred, investigate and configure retry strategy. Error: ${JSON.stringify(
            err
          )}`
        );
        return;
      }
      switch (err.code) {
        case "ConditionalCheckFailedException":
          console.error(
            `Condition check specified in the operation failed, review and update the condition check before retrying. Error: ${err.message}`
          );
          return;
        case "TransactionConflictException":
          console.error(`Operation was rejected because there is an ongoing transaction for the item, generally safe to retry ' +
       'with exponential back-off. Error: ${err.message}`);
          return;
        case "ItemCollectionSizeLimitExceededException":
          console.error(
            `An item collection is too large, you're using Local Secondary Index and exceeded size limit of` +
              `items per partition key. Consider using Global Secondary Index instead. Error: ${err.message}`
          );
          return;
        default:
          break;
        // Common DynamoDB API errors are handled below
      }
      handleCommonErrors(err);
    }

    function handleCommonErrors(err) {
      switch (err.code) {
        case "InternalServerError":
          console.error(
            `Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}`
          );
          return;
        case "ProvisionedThroughputExceededException":
          console.error(
            `Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off.` +
              `Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}`
          );
          return;
        case "ResourceNotFoundException":
          console.error(
            `One of the tables was not found, verify table exists before retrying. Error: ${err.message}`
          );
          return;
        case "ServiceUnavailable":
          console.error(
            `Had trouble reaching DynamoDB. generally safe to retry with exponential back-off. Error: ${err.message}`
          );
          return;
        case "ThrottlingException":
          console.error(
            `Request denied due to throttling, generally safe to retry with exponential back-off. Error: ${err.message}`
          );
          return;
        case "UnrecognizedClientException":
          console.error(
            `The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying.` +
              `Error: ${err.message}`
          );
          return;
        case "ValidationException":
          console.error(
            `The input fails to satisfy the constraints specified by DynamoDB, ` +
              `fix input before retrying. Error: ${err.message}`
          );
          return;
        case "RequestLimitExceeded":
          console.error(
            `Throughput exceeds the current throughput limit for your account, ` +
              `increase account level throughput before retrying. Error: ${err.message}`
          );
          return;
        default:
          console.error(
            `An exception occurred, investigate and configure retry strategy. Error: ${err.message}`
          );
          return;
      }
    }
  });
};

exports.addItem = addItem;