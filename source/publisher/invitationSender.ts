import * as amqp from 'amqplib';

const createMQProducer = async (amqpUrl: string, queueName: string) => {
  console.log('Connecting to RabbitMQ...');
  const connection = await amqp.connect(amqpUrl);
  const channel = await connection.createChannel();

  console.log('Connected to RabbitMQ');

  const producer = (msg: string) => {
    console.log('Produce message to RabbitMQ...');
    channel.sendToQueue(queueName, Buffer.from(msg));
  };

  return producer;
};

export default createMQProducer;
