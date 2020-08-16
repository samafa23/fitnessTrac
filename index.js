require('dotenv').config();

const { PORT = 3000 } = process.env
const express = require('express');
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const bodyParser = require('body-parser');
server.use(bodyParser.json());

const morgan = require('morgan');
server.use(morgan('dev'));

const apiRouter = require('./api');
server.use('/api', apiRouter);

const { client } = require('./db');
client.connect();

server.listen(PORT, 'localhost', () => {
    console.log('The server is up on port:', PORT);
});
