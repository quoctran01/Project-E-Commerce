const mongoose = require("mongoose");

const connect = (url) => {
  return mongoose
    .connect(url)
    .then(() => console.log("db connect successfully.."));
};

module.exports = connect;
