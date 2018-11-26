var express = require('express');
var router = express.Router();
var db = require('../db/mongo.js');


router.get('/', function(req, res, next){
	db._connect()

	let BlogModel = require('../db/models/blog')
	let msg = new BlogModel({
  		blog: 'My First Blog',
  		num: Math.random()
	})

	msg.save()
   	   .then(doc => {
        	console.log(doc)
   		})
   		.catch(err => {
     		console.error(err)
   		})

	res.send('db connection: ' + msg.blog)
	//res.render('db', {VARS})
})


module.exports = router