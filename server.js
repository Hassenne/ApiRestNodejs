//Imports
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;


//Instantiate server
var server = express();

//Body Parser Configuration
server.use(bodyParser.urlencoded({ extended: true}));
server.use(bodyParser.json());

//Configure routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur mon super server</h1>');
});

server.use('/api/', apiRouter);

//launch server
server.listen(8080, function(){
    console.log('Server en ecoute :)');
});
