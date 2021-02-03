const express = require("express");
const connectDB = require("./config/db");

const app = express();

//Connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("API is running ..");
});

//Define The Routes
app.use("/api/user", require("./routes/api/users"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Application is running on port : ${port}`);
});
