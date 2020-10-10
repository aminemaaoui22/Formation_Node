const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Favourites = require('../models/Favourites');

const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        Favourites.find({})
            .populate('user')
            .populate('dishes')
            .then((favourites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        let len = req.params.length
        Favourites.findOne({ user: req.user.id })
            .then((favourite) => {
                if (favourite != null) {
                    for (let i = 0; i < len; i++) {
                        if (favourite.indexOf(req.params[0]) < 0) {
                            favourite.dishes.push(req.params[0]);
                            req.params.unshift();
                        }
                    }
                    favourite.save()
                        .then((favourite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    let favs = [];
                    for (let i = 0; i < len; i++) {
                        if (favs.indexOf(req.params[0]) < 0) {
                            favs.push(req.params[0]);
                            req.params.unshift();
                        }
                    }
                    Favourites.create(
                        {
                            user: req.user._id,
                            dishes: favs
                        }
                    )
                        .then((favourite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            })
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on favourites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favourites.find({ user: req.user._id })
            .then((favourites) => {
                favourites.remove({})
                    .then((favourites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourites);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            })
    })

favouriteRouter.route('/:dishId')
    .get(authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ user: req.user._id })
            .then((favourites) => {
                if (!favourites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favourites": favourites });
                }
                else {
                    if (favourites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favourites": favourites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favourites": favourites });
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ user: req.user._id })
            .then((favourites) => {
                if (favourites != null && favourites.dishes.indexOf(req.params.dishId) < 0) {
                    favourites.dishes.push(req.params.dishId);
                    favourites.save()
                        .then((favourite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else if (favourites == null) {
                    Favourites.create(
                        {
                            user: req.user._id,
                            dishes: [req.params.dishId]
                        }
                    )
                        .then((favourite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                } else {
                    res.statusCode = 403;
                    err = new Error('Favourite already exists');
                    return next(err);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ user: req.user._id })
            .then((favourite) => {
                if (favourite != null) {
                    if (favourite.dishes.indexOf(req.params.dishId) >= 0) {
                        favourite.dishes.pop();
                        res.statusCode = 200;
                        res.json(favourite);
                    }
                    else {
                        err = new Error('Favourite does not exist');
                        res.statusCode = 403;
                        return next(err);
                    }
                } else {
                    res.statusCode = 403;
                    err = new Error('No existing favourites');
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = favouriteRouter;