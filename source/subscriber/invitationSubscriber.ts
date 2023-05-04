// import { Channel, Connection, ConsumeMessage } from "amqplib";
// import * as client from "amqplib";

// const createMQConsumer = async (rabbitMQURL: string, queueName: string) => {
//   const connection: Connection = await client.connect(rabbitMQURL);
//   // Create a channel
//   const channel: Channel = await connection.createChannel();
//   // Make the queue available to the client
//   await channel.assertQueue(queueName);
//   // Start the consumer
//   await channel.consume(queueName, consumer(channel));
// }

// const consumer = (channel: Channel) => (msg: ConsumeMessage | null): void => {
//   if (msg) {
//     // Display the received message
//     console.log("Invite the customer with ID ", msg.content.toString());
//     // Acknowledge the message
//     channel.ack(msg);
//   }
// }

// export default createMQConsumer;

import { Channel, Connection, ConsumeMessage } from "amqplib";
import * as client from "amqplib";

class MQConsumer {
  private rabbitMQURL: string;
  private queueName: string;
  private connection?: Connection;
  private channel?: Channel;

  constructor(rabbitMQURL: string, queueName: string) {
    this.rabbitMQURL = rabbitMQURL;
    this.queueName = queueName;
  }

  async start(): Promise<void> {
    this.connection = await client.connect(this.rabbitMQURL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName);
    await this.channel.consume(this.queueName, this.onMessageReceived.bind(this));
  }

  private onMessageReceived(msg: ConsumeMessage | null): void {
    if (msg) {
      console.log("Invite the customer with ID ", msg.content.toString());
      this.channel?.ack(msg);
    }
  }

  async stop(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

export default MQConsumer;
