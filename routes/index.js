var express = require('express');
var router = express.Router();

router.use('/info', require('./info/index.js'));
router.use('/auth', require('./auth/index.js'));

module.exports = router;
