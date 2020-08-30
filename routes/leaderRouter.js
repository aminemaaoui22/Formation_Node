const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end('We will send all leaders to you!');
    })
    .post((req, res, next) => {
        res.end('We will add the leader: ' + req.body.name + ' with details: ' + req.body.description);
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on leaders');
    })
    .delete((req, res, next) => {
        res.end('Deleting all leaders!');
    });

leaderRouter.route('/:leaderId')
.get((req,res,next) => {
    res.statusCode = 200;
    res.end('We will send details of leader: ' + req.params.leaderId);
})
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on leaders/' + req.params.leaderId);
})
.put((req,res,next) => {
    res.write('Updating the leader: ' + req.params.leaderId + '\n');
    res.end('We will update the leader: ' + req.body.name + ' with details: ' + req.body.description);
})
.delete((req,res,next) => {
    res.end('Deleting leader: ' + req.params.leaderId);
});

module.exports= leaderRouter;