const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AuthorizationError = require('../errors/authorization-err');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return v.length >= 2 && v.length <= 30;
      },
      message: 'Длина должна быть от 2 до 30 символов',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: 'Неверный email',
    },
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthorizationError('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthorizationError('Неправильные почта или пароль'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
