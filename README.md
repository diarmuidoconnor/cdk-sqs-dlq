
-------------

$ aws sqs send-message 
  --queue-url https://sqs.eu-west-1.amazonaws.com/517039770760/Demo-Stk-DemoQueueA7C0530A-FdRfEAcHwKCH 
  --message-body "Hello world."

$ aws sqs send-message --queue-url https://sqs.eu-west-1.amazonaws.com/517039770760/Demo-Stk-DemoQueueA7C0530A-bQ8NgZV2f7bP  --message-body file://./message.json

$ aws lambda invoke --function-name SimpleAppStack-SimpleFn7D0601E0-znMGo1Ft8A60 response.json


--------------

import { SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event) => {
  try {
    console.log("Event: ", JSON.stringify(event));
    for (const record of event.Records) {
      console.log("Message:  ", record.body);
    }
  } catch (error) {
    console.log(JSON.stringify(error));
  }
};

===============================================

type OrderMix = Order | BadOrder;
const orders: OrderMix[] = [
  {
    customerName: "User1",
    customerAddress: "1 Main Street",
    items: [],
  },
  {
    customerName: "User2",
    customerAddress: "1 Main Street",
    items: [],
  },  
  {
    customerName: "User3",
    customerAddress: "1 Main Street",
    items: [],
  },
  ....... other orders .......
];

const client = new SQSClient({ region: "eu-west-1" });

export const handler: Handler = async (event) => {
  try {
    const entries: SendMessageBatchRequestEntry[] = orders.map((order) => {
      return {
        Id: v4(),
        MessageBody: JSON.stringify(order),
      };
    });
    const batchCommandInput: SendMessageBatchCommandInput = {
      QueueUrl: process.env.QUEUE_URL,
      Entries: entries,
    };
    const batchResult = await client.send(
      new SendMessageBatchCommand(batchCommandInput)
    );
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: "All orders queued for processing",
    };
  } catch (error) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};
=====================================================
// Relevant CDK code

const badOrdersQueue = new Queue(this, 'bad-orders-q');

const ordersQueue = new Queue(this, 'orders-queue', {
  deadLetterQueue: {
    queue: badOrdersQueue,
    // # of rejections by consumer (lambda function) before
    // message is transferred to DLQ
    maxReceiveCount: 1,
  },
});

// .... declare Lambda function resources .......

// Set SQS queues as Event sources for lambda functions
processOrdersFn.addEventSource(new SqsEventSource(ordersQueue))
failedOrdersFn.addEventSource(new SqsEventSource(badOrdersQueue));

// Grant function IAM rights to send messages.
ordersQueue.grantSendMessages(generateOrdersFn)

<!-- --------------------------- -->

type BadOrder = Partial<Order>;
type OrderMix = Order | BadOrder;
const orders: OrderMix[] = [
  {
    customerName: "User1",
    customerAddress: "1 Main Street",
    items: [],
  },
  {
    customerName: "User2",
    customerAddress: "1 Main Street",
    items: [],
  },  
 z
  {   // Bad Order
    customerName: "UserX",
    items: [],
  },
  .... Other good orders .....
];

const client = 
          new SQSClient({ region: "eu-west-1" });

export const handler: Handler = async (event) => {
  try {
    const entries: SendMessageBatchRequestEntry[] = 
     orders.map((order) => {
       return {
         Id: v4(),
         MessageBody: JSON.stringify(order),
       };
    });
    const batchCommandInput: SendMessageBatchCommandInput = {
      QueueUrl: process.env.QUEUE_URL, Entries: entries,
    };
    const batchResult = await client.send(
      new SendMessageBatchCommand(batchCommandInput)
    );
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: "All orders queued for processing",
    };
  } catch (error) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};
<!-- ----------------------------- -->
// Order Q processor

const ajv = new Ajv();
const isValidOrder = ajv.compile(schema.definitions["Order"] || {});
export const handler: SQSHandler = async (event) => {
  try {
    for (const record of event.Records) {
      const messageBody = JSON.parse(record.body);
      if (!isValidOrder(messageBody)  ) {
        throw new Error(" Bad Order");
      }
      // process good order
    }
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
};
---------------------------
// Bad Oeder Q processor

export const handler: SQSHandler = async (event) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body)
      // process bad order
    }
  } catch (error) {
    console.log(JSON.stringify(error));
  }
};

