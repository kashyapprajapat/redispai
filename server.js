import express from "express";
import Redis from "ioredis";
import axios from "axios";
const app = express();
const PORT = process.env.PORT || 7000;
import dotenv from "dotenv";

dotenv.config();
const products = [
  {
    id: 1,
    name: "hp laptop 💻",
    price: 100000,
  },
  {
    id: 2,
    name: "Samsung s24 📱",
    price: 55000,
  },
  {
    id: 3,
    name: "Smart watch ⌚",
    price: 23550,
  },
  {
    id: 4,
    name: "Whoop",
    price: 45099,
  },
];

//// ------>>>>     For Local Setup ------------
// const redis = new Redis({
//   host: "localhost",
//   port: 6379,
// });
////  -------------------------------------------

//// --------- >> >> >>>  UPSTAsh cloud free tier
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("Redis connected ");
});

app.get("/", (req, res) => {
  res.send("hello world..");
});

app.get("/products", async (req, res) => {
  const isExist = await redis.exists("userproduct");
  if (isExist) {
    const cachedProducts = await redis.get("userproduct");
    return res.json({
      products: JSON.parse(cachedProducts),
    });
  }

  await redis.set("userproduct",JSON.stringify(products));

  setTimeout(() => {
    res.json({
      products,
    });
  }, 3000);
});


/// v1 without reddis 
app.get("/quate", async (req, res) => {
  const result = await axios.get(
    "https://api.freeapi.app/api/v1/public/quotes?page=1&limit=10&query=human"
  );
  const redata = result.data; 
  return res.json(redata);
});

/// v2 with reddis 
app.get("/v2/quate", async (req, res) => {
  const isExist = await redis.exists("quates");
  if (isExist) {
    const cachedQuate = await redis.get("quates");
    return res.json({
      products: JSON.parse(cachedQuate),
    });
  }
  const result = await axios.get(
    "https://api.freeapi.app/api/v1/public/quotes?page=1&limit=10&query=human"
  );
  const redata = result.data; 
  await redis.setex("quates", 180, JSON.stringify(redata));
  return res.json(redata);
});

app.listen(PORT, () => {
  console.log(`Server is Running At the PORT : ${PORT}`);
});
