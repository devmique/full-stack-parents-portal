import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://localhost:6379"
});

redisClient.on("error", (err) =>
  console.log("Redis Error:", err)
);

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Connected to Docker Redis");
  }
}

export default redisClient;
