const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("API is running ..");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Application is running on port : ${port}`);
});
