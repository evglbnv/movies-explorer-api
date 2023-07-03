const userRouter = require('express').Router();

const {
  getUser,
  updateProfile,
} = require('../controllers/users');

const {
  validationUpdateProfile,
} = require('../utils/validation');

userRouter.get('/me', getUser);
userRouter.patch('/me', validationUpdateProfile, updateProfile);

module.exports = userRouter;
