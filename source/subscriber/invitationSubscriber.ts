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
    try {
      this.connection = await client.connect(this.rabbitMQURL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName);
      await this.channel.consume(this.queueName, this.onMessageReceived.bind(this));
    } catch (error) {
      console.log(error);
    }

  }

  private onMessageReceived(msg: ConsumeMessage | null): void {
    if (msg) {
      console.log("Invite the customer with ID ", msg.content.toString());
      this.channel?.ack(msg);
    }
  }

  async stop(): Promise<void> {
    try {

      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      console.log(error);
    }
  }
}

export default MQConsumer;
