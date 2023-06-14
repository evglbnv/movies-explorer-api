const userRouter = require('express').Router();

const { getUser, updateProfile } = require('../controllers/users');

userRouter.get('/me', getUser);
userRouter.patch('/me', updateProfile);

module.exports = userRouter;
