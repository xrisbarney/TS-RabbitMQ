import { Channel, Connection, ConsumeMessage } from "amqplib";
import * as client from "amqplib";

class MQPublisher {
  private connection?: Connection;
  private channel?: Channel;
  private rabbitMQURL: string;
  private queueName: string;

  constructor(rabbitMQURL: string, queueName: string) {
    this.queueName = queueName;
    this.rabbitMQURL = rabbitMQURL;
  }

  async start(): Promise<void> {
    console.log('Connecting to RabbitMQ...');
    this.connection = await client.connect(this.rabbitMQURL);
    this.channel = await this.connection.createChannel();
    console.log('Connected to RabbitMQ');
  }

  public async publish(msg: string) {
    console.log('Sending message to RabbitMQ...');
    this.channel?.sendToQueue(this.queueName, Buffer.from(msg));
  }

  async stop(): Promise<void> {
    console.log('Closing connection to RabbitMQ...');
    await this.channel?.close();
    await this.connection?.close();
  }
}

export default MQPublisher;

