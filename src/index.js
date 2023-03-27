require("dotenv").config();
require("express-async-errors");
const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
//database
const connect = require("./db/connect");
//router
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRouter");
const reviewRouter = require("./routes/reviewRouter");
const orderRouter = require("./routes/orderRouter");
//error
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//mid
//app.set("trust proxy", 1);
app.use("/", express.static(path.join(__dirname, "public")));
app.use(morgan("tiny"));
app.use(cors());
app.use(xss());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET)); //sign cookie
app.use(fileUpload());

app.get("/", (req, res) => {
  console.log(req.signedCookies);
  res.send("home page");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connect(process.env.MONGO_URI);
    app.listen(port, console.log(`App listening on port ${port}....`));
  } catch (error) {
    console.log(error);
  }
};
start();
