var express = require('express');
var router = express.Router();

router.use('/show', require('./show.js'));
router.use('/write',require('./write.js'));

module.exports = router;
