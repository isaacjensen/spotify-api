const router = require('express').Router();

router.use('/songs', require('./songs'));
router.use('/albums', require('./albums'));
router.use('/artists', require('./artists'));
router.use('/users', require('./users'));

module.exports = router;