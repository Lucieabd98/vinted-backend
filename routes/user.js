const express = require("express");
const router = express.Router();
const uid2 = require("uid2"); // Sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // Sert à hasher
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string

const User = require("../models/User");

// Création d'un nouvel utilisateur 🆕

router.post("/user/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // console.log(user);

    // console.log(req.body.username);

    if (!req.body.username) {
      // car req.body.username est undefined si pas de username donné
      return res.status(400).json({ message: "Username is mandatory" });
    }

    if (user !== null) {
      //si user avec email existe déjà
      return res.status(409).json({ message: "User already exists" });
    } else {
      // Je crée ma variable salt (string aléatoire) 🧂
      const newUserSalt = uid2(16);
      // console.log("salt ==>", newUserSalt);

      // Je crée ma variable hash (va hasher) qu'on va ensuite modifier en string 🔪
      const newUserHash = SHA256(req.body.password + newUserSalt).toString(
        encBase64
      );
      // console.log("hash ===> ", newUserHash);

      //Je crée token (pas encore vu)
      const newUserToken = uid2(64);
      // console.log("token   ", newUserToken);

      // console.log(req.body);

      // Création de mon newUser selon le modèle User ⬇️

      const newUser = new User({
        email: req.body.email,
        account: {
          username: req.body.username,
          avatar: Object, // nous verrons plus tard comment uploader une image
        },
        newsletter: req.body.newsletter,
        token: newUserToken,
        hash: newUserHash,
        salt: newUserSalt,
      });
      // console.log(newUser);

      await newUser.save();

      res.status(201).json({
        id: newUser.id,
        token: newUser.token,
        account: { username: newUser.account.username },
      });
    }
    // console.log("password ==>", req.body.password);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Si on veut log in 👩🏻‍💻

router.post("/user/login", async (req, res) => {
  try {
    // console.log(req.body);

    const existingUser = await User.findOne({ email: req.body.email });
    // console.log(existingUser);  si n'existe pas --> null
    // console.log(existingUser); : si existe --> objet avec notamment token, hash et salt

    //on récupère salt pour le tester en hash avec le password donné en req.body.password

    const testHash = SHA256(req.body.password + existingUser.salt).toString(
      encBase64
    );
    // console.log(testHash);

    if (testHash === existingUser.hash) {
      // console.log("les mots de passe concordent ");
      res.status(200).json({
        _id: existingUser.id,
        token: existingUser.token,
        account: {
          username: existingUser.account.username,
        },
      });
    } else if (testHash !== existingUser.hash) {
      return res.status(400).json({
        message: "Email or password incorrect, connection not authorised",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
