/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { limiter } = require('./utils/rateLimit');
const { handleErrors } = require('./middlewares/handleErrors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes/index');

const { PORT = 3000 } = process.env;

const allowedCors = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://evglbnvdiploma.nomoredomains.rocks',
  'http://evglbnvdiploma.nomoredomains.rocks',
  'https://api.evglbnvdiploma.nomoredomains.rocks',
  'http://api.evglbnvdiploma.nomoredomains.rocks',
];

const app = express();

app.use(cors(allowedCors));
// Without `express.json()`, `req.body` is undefined. Needed for parsing application/json
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

mongoose
  .connect('mongodb://127.0.0.1:27017/bitfilmsdb')
  .then(() => console.log('Connected'))
  .catch((error) => console.log(`Error during connection ${error}`));

app.use(requestLogger);
app.use(limiter);
app.use('/', router);
app.use(errorLogger);
app.use(errors());
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
