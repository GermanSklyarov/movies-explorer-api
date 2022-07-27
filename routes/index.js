const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { login, createUser, logout } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-err');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
router.get('/signout', logout);
router.use(auth);
router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use('/', (req, res, next) => {
  const err = new NotFoundError('Not found');
  next(err);
});

module.exports = router;
