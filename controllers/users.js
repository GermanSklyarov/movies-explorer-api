const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');
const ConflictingRequestError = require('../errors/conflicting-request-err');

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictingRequestError('Данный email уже зарегистрирован');
      }
    })
    .catch(next);

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      name: user.name,
      email: user.email,
    }))
    .catch(next);
};
module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};
module.exports.updateUser = (req, res, next) => {
  const { email } = req.body;

  if (email) {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          throw new ConflictingRequestError('Данный email уже зарегистрирован');
        }
      })
      .catch(next);
  }
  User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch(next);
};
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });
      res.send({ token });
    })
    .catch(next);
};
module.exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.send({ message: 'токен удален' });
};