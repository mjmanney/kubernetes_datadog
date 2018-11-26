const mongoose = require('mongoose')

let blogSchema = new mongoose.Schema({
  blog: String,
  num: Number
})

module.exports = mongoose.model('Blog', blogSchema)