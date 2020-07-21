// Required libraries
var express = require("express");
var router = express.Router();
var dateFormat = require("dateformat");

//Importing models
var User = require("../models/user");
var Post = require("../models/post");

var loggedUser;

// Good validation documentation available at https://express-validator.github.io/docs/
const { sanitizeBody } = require("express-validator");

//Connecting to the database with mongoose
const mongoose = require("mongoose");
var dbUrl =
  "mongodb+srv://dbAdmin:dbAdmin@microblog.jj5rx.gcp.mongodb.net/blog_library?retryWrites=true&w=majority";
mongoose
  .connect(dbUrl, { useNewUrlParser: true })
  .catch(err => console.log(err));
mongoose.connection
  .once("open", function() {
    console.log("Connected");
  })
  .on("error", function(error) {
    console.log("There's an error", error);
  });

//Rendering the posts.pug view
router.get("/", function(req, res, next) {
  Post.find({}).exec(function(err, data) {
    if (err) return next(err);
    res.render("posts", {
      title: "Posts",
      logUserMsg: loggedUser,
      post_list: data
    });
  });
});

//Logging in
router.post(
  "/login",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    var local_user = req.body.userlogin;
    var local_password = req.body.pwlogin;
    loggedUser = local_user;

    //Checks if the username and password match exists in the database
    User.find({}).exec(function(err, data) {
      if (err) return next(err);
      Post.find({}).exec(function(err, data1) {
        if (err) return next(err);
        if (local_user && local_password !== "") {
          var foundUser = 0;
          for (var i = 0; i < data.length; i++) {
            if (
              data[i].username === local_user &&
              data[i].password === local_password
            ) {
              foundUser++;
            }
          }
          if (foundUser === 0) {
            res.render("index", {
              title: "MicroBlog",
              logMessage: "Wrong username or password.",
              post_list: data1
            });
          } else {
            res.redirect("/posts");
          }
        } else {
          res.render("index", {
            title: "MicroBlog",
            logMessage: "Fill in log in details.",
            post_list: data1
          });
        }
      });
    });
  }
);

//Creating a new account
router.post(
  "/signup",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    var local_user = req.body.usersignup;
    var local_password = req.body.pwsignup;

    //Checking if the new username already exists in the database
    if (local_user && local_password !== "") {
      User.find({}).exec(function(err, data) {
        if (err) return next(err);
        Post.find({}).exec(function(err, data1) {
          if (err) return next(err);
          var counter = 0;
          for (var i = 0; i < data.length; i++) {
            if (data[i].username === local_user) {
              counter++;
            }
          }
          if (counter > 0) {
            res.render("index", {
              title: "MicroBlog",
              signMessage1: "Username already in use.",
              post_list: data1
            });
          } else {
            var user = new User({
              username: local_user,
              password: local_password
            });
            user.save(function(err) {
              if (err) return next(err);
              Post.find({}).exec(function(err, data1) {
                if (err) return next(err);
                res.render("index", {
                  title: "MicroBlog",
                  signMessage2:
                    "New user added succesfully. You may now log in.",
                  post_list: data1
                });
              });
            });
          }
        });
      });
    } else {
      Post.find({}).exec(function(err, data1) {
        if (err) return next(err);
        res.render("index", {
          title: "MicroBlog",
          signMessage1: "Fill in all the fields.",
          post_list: data1
        });
      });
    }
  }
);

//Logging out and returning to the home page (index.pug)
router.post("/logout", function(req, res, next) {
  res.redirect("/");
});

//Creating a new post
router.post(
  "/create",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    var local_content = req.body.content;

    if (local_content !== "") {
      //Creating the Finnish date and time for the creation time of the post
      var finnishTime = new Date().getTime() + 3 * 60 * 60 * 1000;
      var date = dateFormat(finnishTime, "HH:MM:ss dd.mm.yyyy");

      var post = new Post({
        user: loggedUser,
        content: local_content,
        time: date
      });
      post.save(function(err) {
        if (err) return next(err);
        res.redirect("/posts");
      });
    } else {
      Post.find({}).exec(function(err, data1) {
        if (err) return next(err);
        res.render("posts", {
          title: "Posts",
          logUserMsg: loggedUser,
          submitMessage: "Write something to post content.",
          post_list: data1
        });
      });
    }
  }
);

//Filtering the posts
router.post(
  "/filter",
  sanitizeBody("*")
    .trim()
    .escape(),
  function(req, res, next) {
    var local_filteruser = req.body.filtername;
    var local_filterdate = req.body.filterdate;
    var day = dateFormat(local_filterdate, "dd.mm.yyyy");

    if (local_filteruser !== "" && local_filterdate !== "") {
      Post.find({ user: local_filteruser, time: new RegExp(day, "i") }).exec(
        function(err, data1) {
          if (err) return next(err);
          res.render("posts", {
            title: "Posts",
            logUserMsg: loggedUser,
            filterMessage:
              "Showing posts made by " + local_filteruser + " on " + day + ".",
            post_list: data1
          });
        }
      );
    } else if (local_filteruser !== "" && local_filterdate === "") {
      Post.find({ user: local_filteruser }).exec(function(err, data1) {
        if (err) return next(err);
        res.render("posts", {
          title: "Posts",
          logUserMsg: loggedUser,
          filterMessage: "Showing posts made by " + local_filteruser + ".",
          post_list: data1
        });
      });
    } else if (local_filteruser === "" && local_filterdate !== "") {
      Post.find({ time: new RegExp(day, "i") }).exec(function(err, data1) {
        if (err) return next(err);
        res.render("posts", {
          title: "Posts",
          logUserMsg: loggedUser,
          filterMessage: "Showing posts made on " + day + ".",
          post_list: data1
        });
      });
    } else {
      Post.find({}).exec(function(err, data1) {
        if (err) return next(err);
        res.render("posts", {
          title: "Posts",
          logUserMsg: loggedUser,
          filterMessage: "Showing all the posts.",
          post_list: data1
        });
      });
    }
  }
);

module.exports = router;
