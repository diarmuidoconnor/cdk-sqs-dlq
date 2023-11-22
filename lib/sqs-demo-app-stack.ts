import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class SQSDemoAppStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // const demoQueue = new Queue(this, "Demo Queue");

    // const qConsumerFn = new NodejsFunction(this, "SQSConsumerFn", {
    //   architecture: Architecture.ARM_64,
    //   runtime: Runtime.NODEJS_16_X,
    //   entry: `${__dirname}/../lambdas/consumeQMessages.ts`,
    //   timeout: Duration.seconds(10),
    //   memorySize: 128,
    // });

    // const eventSource = new SqsEventSource(demoQueue);
    // qConsumerFn.addEventSource(eventSource)

    // new CfnOutput(this, "Queue Url", { value: demoQueue.queueUrl });

    // ================================

    
    const ordersQueue = new sqs.Queue(this, "orders-queue", {
      // deadLetterQueue: {
      //   queue: badOrdersQueue,
      //   // # of rejections by consumer (lambda function)
      //   maxReceiveCount: 1,
      // },
      // visibilityTimeout: Duration.seconds(10)
    });
    
    const processOrdersFn = new NodejsFunction(this, "ProcessOrdersFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/processOrders.ts`,
      timeout: Duration.seconds(10),
      memorySize: 128,
    });
    
    // For testing purposes
    const generateOrdersFn = new NodejsFunction(this, "GenerateOrdersFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambdas/generateOrders.ts`,
      timeout: Duration.seconds(10),
      memorySize: 128,
      environment: {
        QUEUE_URL: ordersQueue.queueUrl,
      },
    });
    
    // const badOrdersQueue = new sqs.Queue(this, "bad-orders-q", {
    //   retentionPeriod: Duration.minutes(30),
    // });

    // const failedOrdersFn = new NodejsFunction(this, "FailedOrdersFn", {
    //   architecture: lambda.Architecture.ARM_64,
    //   runtime: lambda.Runtime.NODEJS_16_X,
    //   entry: `${__dirname}/../lambdas/handleBadOrder.ts`,
    //   timeout: Duration.seconds(10),
    //   memorySize: 128,
    // });
 
    // failedOrdersFn.addEventSource(new SqsEventSource(badOrdersQueue));
    
    // Set SQS queues as Event sources for lambda functions
    processOrdersFn.addEventSource(
      new SqsEventSource(ordersQueue, {
        maxBatchingWindow: Duration.seconds(10),
        maxConcurrency: 2,
      })
      );
      
    // Grant function IAM rights to send messages.
    ordersQueue.grantSendMessages(generateOrdersFn);

    new CfnOutput(this, "Generator Lambda name", {
      value: generateOrdersFn.functionName,
    });
  }
}
