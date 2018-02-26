var express = require('express');
var router = express.Router();

router.use('/', require('./register.js'));
router.use('/search',require('./search.js'));
router.use('/modify',require('./modify.js'));
module.exports = router;
