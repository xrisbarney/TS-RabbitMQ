import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import * as express from 'express';
import invitationRouter from "./routes/invitation.routes";
import MQConsumer from './subscriber/invitationSubscriber';

const rabbitMQURL: string = process.env.RABBITMQ_URL?.toString() || "amqp://username:password@192.168.33.17:5672";
const eventQueue: string = "customerInvites";

const main = async (): Promise<void> => {
  const app = express();
  app.use(express.json());

  const port = process.env.PORT;

  const consumer = new MQConsumer(rabbitMQURL, eventQueue);
  await consumer.start();

  // Routing
  app.get('/', (req, res) => {
    res.send('Hello!');
  });
  app.use("/api", invitationRouter(rabbitMQURL, eventQueue));

  app.listen(port, (): void => {
    console.log(`Server is running on port ${port}`);
  });
};

main().catch((err) => {
  console.log(err);
});

export { rabbitMQURL, eventQueue };
