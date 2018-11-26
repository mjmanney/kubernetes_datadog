var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var msg = 'Containerizing a node + mongo app! And add APM!'
  res.render('index', { title: 'Hack Day!', message: msg});
});



module.exports = router;
