/* eslint-disable consistent-return */

const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const NotFoundError = require('../error/notFoundError');
const BadRequestError = require('../error/badRequest');
const ConflictError = require('../error/conflictError');
const AuthenticationError = require('../error/authenticationError');

const { NODE_ENV, SECRET_KEY } = process.env;

const User = require('../models/user');

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
            return next(
              new BadRequestError('Неверная информация пользователя'),
            );
          } else {
            return next(err);
          }
        });
    });
};

const getUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь с таким id не найден'));
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Некорректные данные пользователя'));
      }
      return next(err);
    });
};

const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError('Такого пользователя не существует'));
      }
      return next(err);
    });
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
