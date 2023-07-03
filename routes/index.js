const router = require('express').Router();
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { validationSignIn, validationSignUp } = require('../utils/validation');
const { ERROR_CODE_NOT_FOUND } = require('../utils/utils');

const userRouter = require('./users');
const movieRouter = require('./movies');

router.post('/signup', validationSignUp, createUser);
router.post('/signin', validationSignIn, login);

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);

router.use('/*', (req, res) => {
  res.status(ERROR_CODE_NOT_FOUND).send({ message: '404: Not Found' });
});

module.exports = router;
