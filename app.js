// Require libraries (edit as required)
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Include external files (edit as required)
var indexRouter = require("./routes/index");
var postsRouter = require("./routes/posts");

// Start the app itself - default
var app = express();

// view engine setup  - default
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Use logging and set settings - default
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Define routes (edit as required)
app.use("/", indexRouter);
app.use("/posts", postsRouter);

// Catch 404 and forward to error handler - default
app.use(function(req, res, next) {
  next(createError(404));
});

// Register error handler - default
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Export app to use with www.js - default
module.exports = app;
