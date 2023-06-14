const Movie = require('../models/movies');

const NotFoundError = require('../error/notFoundError');
const BadRequestError = require('../error/badRequest');
const ForbiddenError = require('../error/forbiddenError');

module.exports.getAllSavedMovies = (req, res, next) => {
  Movie.find({})
    .populate('owner')
    .then((movie) => res.send({ data: movie }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  const owner = req.user._id;

  Movie.create({
    owner,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.status(201).send({ data: movie })).catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(new NotFoundError('Такого фильма не существует'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        return next(new ForbiddenError('Недостаточно прав'));
      }
      return Movie.findByIdAndDelete(req.params.movieId).then(() => res.send({ data: movie }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Неверная информация карточки'));
      }
      return next(err);
    });
};
