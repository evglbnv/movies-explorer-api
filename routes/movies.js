const movieRouter = require('express').Router();

const {
  getAllSavedMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');
const { validationCreateMovie, validationMovieId } = require('../utils/validation');

movieRouter.get('/', getAllSavedMovies);
movieRouter.post('/', validationCreateMovie, createMovie);
movieRouter.delete('/:movieId', validationMovieId, deleteMovie);

module.exports = movieRouter;
