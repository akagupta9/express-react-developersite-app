const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

//Connection with mongo db
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    console.log(`MongoDB database connection is successful.`);
  } catch (err) {
    console.log(`Error while connecting the Mongoo DB. ERROR: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
