import amqplib, { Channel, Connection } from "amqplib";
import dotenv from "dotenv";
import cron from "node-cron";
import { CONSTANTS } from "../constants";
import { format } from "date-fns";
import axios from "axios";

dotenv.config();

type User = {
  id: number;
  firstName: string;
  lastName: string;
};

type Content = {
  name: string;
};

const localInstance = axios.create({
  baseURL: process.env.HOST
})

export async function connect() {
  let interval = null;
  let task = null;
  try {
    const amqpServer = process.env.AMQP_SERVER || "amqp://localhost:5672";
    const connection: Connection = await amqplib.connect(amqpServer);
    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(CONSTANTS.QUEUE_NAME, {
      durable: true,
    });

    task = cron.schedule("* * * * *", () => {
      const date = new Date().getDate();
      const month = format(new Date(), "MMMM");

      localInstance
        .get(`/users?date=${date}&month=${month}`)
        .then((res) => {
          if ((res.data.users || []).length) {
            res.data.users.forEach((user: User) => {
              channel.sendToQueue(
                CONSTANTS.QUEUE_NAME,
                Buffer.from(
                  JSON.stringify({ name: `${user.firstName} ${user.lastName}` })
                ),
                {
                  persistent: true,
                }
              );
            });
          } else {
            console.log(res);
            throw new Error(CONSTANTS.NOT_FOUND);
          }
        })
        .catch(console.log);
    });

    channel.consume(
      CONSTANTS.QUEUE_NAME,
      function (msg) {
        const content: Content = JSON.parse(
          (msg || { content: "" }).content.toString()
        );
        if (content.name) {
          localInstance.post("/users/send-email", {
            email: "test@digitalenvision.com.au",
            message: CONSTANTS.CONGRATULATE_MSG(content.name),
          });
        }
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    interval && clearInterval(interval);
    task && task.stop();
    console.log(error);
  }
}
