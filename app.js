/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const { handleErrors } = require('./middlewares/handleErrors');
const router = require('./routes/index');

const { PORT = 3000 } = process.env;

const app = express();
app.use(express.json());

mongoose
  .connect('mongodb://localhost:27017/bitfilmsdb')
  .then(() => console.log('Connected'))
  .catch((error) => console.log(`Error during connection ${error}`));

app.use('/', router);
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
