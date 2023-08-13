// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  summary: String,
  content: String,
  cover: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
