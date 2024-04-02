const express = require("express");
const cloudinary = require("cloudinary").v2; // cloudinary 🌥️
const router = express.Router();

const fileUpload = require("express-fileupload"); //
const convertToBase64 = require("../utils/convertToBase64");
// On importe les modèles
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");

const stripe = require("stripe")(process.env.STRIPE_API);

// création d'une route qui permettra de poster une annonce.
// chaque annonce doit avoir une référence vers l'utilisateur qui la poste
// l'utilisateur doit etre authentifié pour pouvoir poster une annonce
// pour poster l'annonce il faut upload l'image dans cloudinary et récupérer son url

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.headers.authorization); // j'ai le token précédé de Bearer

      // console.log(req.body); // j'ai toutes mes données sous forme de tableau
      // console.log(req.files.Picture); // j'ai toutes mes données de ma photo que je vais pouvoir utiliser pour la convertir

      const convertedFile = convertToBase64(req.files.Picture);
      // console.log(convertedFile); // j'ai mon image sous forme de lettres

      // console.log(uploadResult); // j'ai mes infos de mon image dont l'url en .secure_url
      // console.log(uploadResult.secure_url);

      const newOffer = new Offer({
        product_name: req.body.Title,
        product_description: req.body.Description,
        product_price: req.body.Price,
        product_details: [
          { MARQUE: req.body.Brand },
          { TAILLE: req.body.Size },
          { ÉTAT: req.body.Condition },
          { COULEUR: req.body.Color },
          { EMPLACEMENT: req.body.City },
        ],
        // product_image: { secure_url: uploadResult.secure_url },
        owner: req.owner,
      });

      const uploadResult = await cloudinary.uploader.upload(convertedFile, {
        folder: `vinted/offers/${newOffer._id}`,
      });

      newOffer.product_image = uploadResult;

      await newOffer.save();
      // await newOffer.populate("owner", "account");

      res.json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

///

router.get("/offers", async (req, res) => {
  try {
    // console.log(req.query);
    // console.log(req.query.page); numéro de page

    // const limit = 5;
    // const skip = limit * req.query.page;

    const filters = {};

    if (req.query.title) {
      const regExp = new RegExp(req.query.title, "i");
      filters.product_name = regExp;
    }

    if (req.query.priceMin && req.query.priceMax) {
      filters.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
    } else if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    } else if (req.query.priceMax) {
      filters.product_price = { $lte: req.query.priceMax };
    }

    console.log(filters);

    const sortKey = {};
    if (req.query.sort) {
      sortKey.product_price = req.query.sort.replace("price-", "");
    }

    let limitKey;

    if (req.query.limit) {
      limitKey = req.query.limit;
    }

    let skipKey;

    if (req.query.page) {
      skipKey = (req.query.page - 1) * 10;
    }

    const offers = await Offer.find(filters)
      .populate("owner", "account")
      .sort(sortKey)
      .skip(skipKey)
      .limit(limitKey)
      .select();
    // console.log(offers);

    const count = await Offer.countDocuments(filters);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    // console.log(req.params.id);

    const findOffer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );

    res.json(findOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
