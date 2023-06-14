/* eslint-disable consistent-return */
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const NotFoundError = require('../error/notFoundError');
const BadRequestError = require('../error/badRequest');
const ConflictError = require('../error/conflictError');
const AuthenticationError = require('../error/authenticationError');

const { NODE_ENV, SECRET_KEY } = process.env;

const User = require('../models/user');

const getUser = (req, res, next) => {
  User.findById(req.user._id).orFail(new NotFoundError('Такого пользователя не существует'))
    .then((user) => res.send(user))
    .catch((err) => next(err));
};

const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail().then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError('Такого пользователя не существует'));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const { email, name, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        name,
        password: hash,
      })
        .then(() => {
          res.send({ message: 'successMessage.registration' });
        })
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким ID существует'));
          } else if (err.name === 'ValidationError') {
            next(
              new BadRequestError('Неверная информация пользователя'),
            );
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthenticationError('Неправильные почта или пароль'));
      }
      return user;
    })
    .then((user) => {
      const matched = bcrypt.compare(password, user.password);
      if (!matched) {
        return Promise.reject(new AuthenticationError('Неправильные почта или пароль'));
      } const token = jsonwebtoken.sign({ _id: user._id }, NODE_ENV === 'production' ? SECRET_KEY : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => next(err));
};

module.exports = {
  getUser,
  updateProfile,
  createUser,
  login,
};
