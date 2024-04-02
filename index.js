require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI);

const cloudinary = require("cloudinary").v2; // cloudinary 🌥️

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Sign Up routes
const signUpRoutes = require("./routes/user");
app.use(signUpRoutes);

// Offer routes
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

// Payment routes
const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

// NE RIEN METTRE EN DESSOUS 🚫
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started 🚀");
});
