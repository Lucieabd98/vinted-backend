const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  //le req est le même que reçoit la route offer
  const receivedToken = req.headers.authorization.replace("Bearer ", "");
  const owner = await User.findOne({ token: receivedToken }).select("account");
  // console.log(receivedToken);

  if (owner) {
    req.owner = owner;
    // console.log(req.owner);

    return next();
  } else {
    return res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthenticated;
