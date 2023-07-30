import amqplib, { Channel, Connection } from "amqplib";
import dotenv from "dotenv";
import cron from "node-cron";
import { CONSTANTS, supportedLocales } from "../constants";
import { format } from "date-fns";
import axios from "axios";

dotenv.config();

type User = {
  id: number;
  firstName: string;
  lastName: string;
  region: string;
  city: string;
};

type Content = {
  name: string;
};

const localInstance = axios.create({
  baseURL: process.env.HOST,
});

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

    task = cron.schedule("0 0 * * *", () => dailyScheduler(channel));

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

function dailyScheduler(channel: Channel) {
  const date = new Date().getDate();
  const month = format(new Date(), "MMMM");

  localInstance
    .get(`/users?date=${date}&month=${month}`)
    .then((res) => {
      if ((res.data.users || []).length) {
        sendQueueBasedOnTimeZone(channel, res.data.users || []);
      } else {
        throw new Error(CONSTANTS.NOT_FOUND);
      }
    })
    .catch(console.log);
}

function sendQueueBasedOnTimeZone(channel: Channel, users: User[]) {
  users.forEach((user: User) => {
    const regions = supportedLocales.filter((locale) =>
      locale.toLowerCase().includes(user.region.toLowerCase())
    );

    const timezone =
      regions.find(
        (region) =>
          region.split("/")[1].toLowerCase().replace(/[\W_]/gi, "") ===
          user.city.toLowerCase().replace(/[\W_]/gi, "")
      ) || regions[0];

    cron.schedule(
      "0 9 * * *",
      () => {
        channel.sendToQueue(
          CONSTANTS.QUEUE_NAME,
          Buffer.from(
            JSON.stringify({ name: `${user.firstName} ${user.lastName}` })
          ),
          {
            persistent: true,
          }
        );
      },
      {
        scheduled: true,
        timezone,
      }
    );
  });
}
