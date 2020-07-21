//Creating the schema for posts
const mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
  user: { type: String, required: true, maxlength: 30 },
  content: { type: String, required: true, maxlength: 300 },
  time: { type: String, required: true }
});

// Export model.
module.exports = mongoose.model("Post", postSchema);
