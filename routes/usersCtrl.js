//Imports
var bcrypt = require('bcrypt');
var jwtUtils = require ('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/


//Routes
module.exports = {
    register: function(req, res) {

        // Params
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var bio = req.body.bio;



        if (email == null || username == null || password == null ) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        if (username.length >= 13 || username.length <= 4) {
            return res.status(400).json({ 'error': 'wrong username ( must be length 5 - 12)'});
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'email is not valid'});
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'password invalid (must length 4-8 include 1 number attribute '})
        }

        asyncLib.waterfall([
            function(done) {
                done(null, 'variable1');
            },
            function(var1, done) {
                done(null);
            }
            ], function(err) {
            if (!err) {
                return res.status(200).json({ 'msg': 'ok'});
            } else {
                return res.status(404).json({ 'error': 'error'});
            }
        });

        // TODO verify pseudo leugth, mail regex, password etc.

        asyncLib.waterfall([
        function(done) {
            models.User.findOne({
                attributes: ['email'],
                where: {email: email}
            })
                .then(function (userFound) {
                    done(null, userFound);
                })
                .catch(function (err) {
                    return res.status(500).json({'error': 'unable to verify user'});
                });
        },
            function (userFound, done) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                        done(null, userFound, bcryptedPassword);
                    });
                } else {
                    return res.status(409).json({ 'error': 'user already exist'});
                }
              },

                function(userFound, bcryptedPassword, done) {
                    var newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcryptedPassword,
                        bio: bio,
                        isAdmin: 0
                    })
                        .then(function (newUser) {
                            done(newUser);
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': 'cannot add user'});
                        });
                }
                ], function(newUser) {
                    if (newUser) {
                        return res.status(201).json({
                            'userId': newUser.id
                        });
                    } else {
                        return res.status(500).json({ 'error': 'cannot add user'});
                    }
                    });

    },
    login: function(req, res) {

        // params

        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null ) {
            return res.status(400).json({ 'error': 'missing parameters'});
        }

        // TODO verify mail regex & password length.

        models.User.findOne({
            where: { email: email }
        })

            .then(function (userFound) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                       if(resBycrypt) {
                           return res.status(200).json({
                               'userId': userFound.id,
                               'token': jwtUtils.generateTokenForUser(userFound)
                           });
                       } else {
                           return res.status(403).json({ 'error' : 'invalid password'});
                       }
                    });

                } else {
                    return res.status(404).json({ 'error': 'user not exist in DB '});
                }

            })

            .catch(function (err) {
                return res.status(500).json({'error': 'unable to verify user'});

            })

    }
}