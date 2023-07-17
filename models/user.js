const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const AuthenticationError = require('../error/authenticationError');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Input valid email',
    },
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthenticationError('Incorrect email or password');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new AuthenticationError('Incorrect email or password');
          }

          return user;
        });
    });
};

// userSchema.statics.findUserByCredentials = function (email, password) {
//   return this.findOne({ email }) // this — это модель User
//     .select('+password')
//     .then((user) => {
//       // получаем объект пользователя, если почта и пароль подошли
//       // не нашёлся — отклоняем промис
//       if (!user) {
//         return Promise.reject(
//           new AuthenticationError('Incorrect email or password'),
//         );
//       }
//       // нашёлся — сравниваем хеши
//       return bcrypt.compare(password, user.password)
//         .then((matched) => {
//           if (!matched) {
//             // отклоняем промис
//             return Promise.reject(
//               new AuthenticationError('Incorrect email or password'),
//             );
//           }
//           return user;
//         });
//     });
// };

module.exports = mongoose.model('user', userSchema);
