import { Channel, Connection, ConsumeMessage } from "amqplib";
import * as client from "amqplib";

const createMQConsumer = async (rabbitMQURL: string, queueName: string) => {
  const connection: Connection = await client.connect(rabbitMQURL)
  // Create a channel
  const channel: Channel = await connection.createChannel()
  // Makes the queue available to the client
  await channel.assertQueue(queueName)
  // Start the consumer
  await channel.consume(queueName, consumer(channel))
}

const consumer = (channel: Channel) => (msg: ConsumeMessage | null): void => {
  if (msg) {
    // Display the received message
    console.log("Invite the customer with ID ", msg.content.toString())
    // Acknowledge the message
    channel.ack(msg)
  }
}

export default createMQConsumer