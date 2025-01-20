const express = require("express");
const moment = require("moment");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());

const mockDatabase = [];

const fetchProducts = async () => {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    return response.data.map((item) => ({
      id: item.id,
      name: item.title,
      price: Math.floor(Math.random() * 100) + 1,
      availability: item.id % 2 === 1 ? "in stock" : "out of stock",
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Unable to fetch products");
  }
};

app.get("/my-orders", async (req, res) => {
  try {
    res.json({ data: mockDatabase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/order", async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product ID or quantity" });
  }

  try {
    const products = await fetchProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.availability === "out of stock") {
      return res.status(400).json({ message: "Product is out of stock" });
    }
    const order = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      totalPrice: product.price * quantity,
      createdAt: moment(),
    };

    mockDatabase.push(order);
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
