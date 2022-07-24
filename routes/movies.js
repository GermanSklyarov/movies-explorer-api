const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { createMovie, getMovies, deleteMovie } = require('../controllers/movies');
const { urlRegex } = require('../utils/constants');

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(urlRegex),
    trailerLink: Joi.string().required().pattern(urlRegex),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().pattern(urlRegex),
    movieId: Joi.required(),
  }).unknown(true),
}), createMovie);
router.get('/', getMovies);
router.delete('/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
