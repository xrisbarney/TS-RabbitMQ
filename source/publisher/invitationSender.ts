// import * as amqp from 'amqplib';

// const createMQProducer = async (rabbitMQURL: string, queueName: string) => {
//   console.log('Connecting to RabbitMQ...');
//   const connection = await amqp.connect(rabbitMQURL);
//   const channel = await connection.createChannel();

//   console.log('Connected to RabbitMQ');

//   const producer = (msg: string) => {
//     console.log('Produce message to RabbitMQ...');
//     channel.sendToQueue(queueName, Buffer.from(msg));
//   };

//   return producer;
// };

// export default createMQProducer;

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
    // this.connect(rabbitMQURL);
  }

  async start(): Promise<void> {
    console.log('Connecting to RabbitMQ...');
    this.connection = await client.connect(this.rabbitMQURL);
    this.channel = await this.connection.createChannel();
    console.log('Connected to RabbitMQ');
    // await this.channel.assertQueue(this.queueName);
    // await this.channel.consume(this.queueName, this.onMessageReceived.bind(this));
  }

  // private async connect(rabbitMQURL: string) {
  //   console.log('Connecting to RabbitMQ...');
  //   this.connection = await amqp.connect(rabbitMQURL);
  //   this.channel = await this.connection.createChannel();
  //   console.log('Connected to RabbitMQ');
  // }

  public async publish(msg: string) {
    console.log('Sending message to RabbitMQ...');
    this.channel?.sendToQueue(this.queueName, Buffer.from(msg));
  }

  // public async close() {
  //   console.log('Closing connection to RabbitMQ...');
  //   await this.channel.close();
  //   await this.connection.close();
  //   console.log('Connection closed');
  // }
  async stop(): Promise<void> {
    console.log('Closing connection to RabbitMQ...');
    await this.channel?.close();
    await this.connection?.close();
  }
}

export default MQPublisher;

