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
    try {
      console.log('Connecting to RabbitMQ...');
      this.connection = await client.connect(this.rabbitMQURL);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.log(error);
    }

  }

  public async publish(msg: string) {
    try {
      console.log('Sending message to RabbitMQ...');
      this.channel?.sendToQueue(this.queueName, Buffer.from(msg));
    } catch (error) {
      console.log(error);
    }
  }

  async stop(): Promise<void> {

    try {
      console.log('Closing connection to RabbitMQ...');
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      console.log(error);
    }
  }
}

export default MQPublisher;

