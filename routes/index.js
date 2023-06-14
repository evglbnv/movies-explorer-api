const router = require('express').Router();
const auth = require('../middlewares/auth');
const { createUser, login } = require('../controllers/users');
const { ERROR_CODE_NOT_FOUND } = require('../utils/utils');

const userRouter = require('./user');

router.use('/users', userRouter);

router.post('/signup', createUser);
router.post('/signin', login);

router.use('/*', (req, res) => {
  res.status(ERROR_CODE_NOT_FOUND).send({ message: '404: Not Found' });
});

module.exports = router;
