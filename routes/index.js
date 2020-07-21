var express = require("express");
var router = express.Router();
var Post = require("../models/post");

/* GET home page. */
//Rendering the index.pug view
router.get("/", function(req, res, next) {
  Post.find({}).exec(function(err, data) {
    if (err) return next(err);
    res.render("index", {
      title: "MicroBlog",
      post_list: data
    });
  });
});

module.exports = router;
