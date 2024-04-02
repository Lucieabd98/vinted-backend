const express = require("express");
const cors = require("cors");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

router.post("/payment", async (req, res) => {
  try {
    // On crée une intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      // Montant de la transaction
      amount: 2000,
      // Devise de la transaction
      currency: "usd",
      // Description du produit
      description: "La description du produit",
    });
    console.log(req.body);

    res.json({ message: req.body });
    // On renvoie les informations de l'intention de paiement au client
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
