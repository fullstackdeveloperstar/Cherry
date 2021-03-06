var express = require('express');
var users = express.Router();
var database = require('../Database/database');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var token;

users.use(cors());

process.env.SECRET_KEY = "devesh";

users.post('/register', function(req, res) {

    var today = new Date();
    var appData = {
        "error": 1,
        "data": ""
    };
    var userData = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "password": req.body.password,
        "created": today
    }

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('INSERT INTO users SET ?', userData, function(err, rows, fields) {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = "User registered successfully!";
                    res.status(201).json(appData);
                } else {
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                }
            });
            connection.release();
        }
    });
});

users.post('/login', function(req, res) {

    var appData = {};
    if (typeof req.body.email === 'undefined' || typeof req.body.password === 'undefined')
    {
        appData["error"] = 1;
        appData["data"] = "Parameters are not matched!";
        res.status(500).json(appData);
        return;
    }
    
    var email = req.body.email;
    var password = req.body.password;


    if(email == "" || password == "") {
        appData["error"] = 1;
        appData["data"] = "User Email or Password is not matched!";
        res.status(500).json(appData);
        return;
    }

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
                if (err) {
                    appData.error = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        if (rows[0].password == password) {
                            
                            let token = jwt.sign(rows[0], process.env.SECRET_KEY, {
                                expiresIn: 1440
                            });

                            connection.query('UPDATE `users` SET token="'+ token +'" WHERE id="'+ rows[0].id +'"', function(error){
                                console.log(error);
                            });

                            appData.error = 0;
                            appData["token"] = token;
                            appData["user"] = rows[0];
                            res.status(200).json(appData);
                        } else {
                            appData.error = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(204).json(appData);
                        }
                    } else {
                        appData.error = 1;
                        appData["data"] = "Email does not exists!";
                        res.status(204).json(appData);
                    }
                }
            });
            connection.release();
        }
    });
});

users.post('/login', function(req, res) {

    var appData = {};
    var email = req.body.email;
    var password = req.body.password;

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
                if (err) {
                    appData.error = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        if (rows[0].password == password) {
                            token = jwt.sign(rows[0], process.env.SECRET_KEY, {
                                expiresIn: 5000
                            });
                            appData.error = 0;
                            appData["token"] = token;
                            res.status(200).json(appData);
                        } else {
                            appData.error = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(204).json(appData);
                        }
                    } else {
                        appData.error = 1;
                        appData["data"] = "Email does not exists!";
                        res.status(204).json(appData);
                    }
                }
            });
            connection.release();
        }
    });
});

users.use(function(req, res, next) {
    var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                next();
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
});

users.get('/getUsers', function(req, res) {

    var appData = {};

    database.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT *FROM users', function(err, rows, fields) {
                if (!err) {
                    appData["error"] = 0;
                    appData["data"] = rows;
                    res.status(200).json(appData);
                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});

users.post('/changepassword', function (req, res) {
    var appData = {};
    console.log('changepassword');
    
    console.log(req.body);
    
    if (typeof req.body.current === 'undefined' || typeof req.body.new === 'undefined') {
        appData["error"] = 1;
        appData["data"] = "Parameters are not matched!";
        res.status(500).json(appData);
        return;
    }
    var currentpwd = req.body.current;
    var newpwd = req.body.new;
    var userId = req.body.id;

    database.connection.getConnection(function(err, connection){
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT *FROM users WHERE id="' + userId + '"', function (err, rows, fields) {
                if (err) {
                    appData["error"] = 0;
                    appData["data"] = "Database transactio error!";
                    res.status(200).json(appData);
                } else {
                  if (rows.length > 0) {
                      if (rows[0].password == currentpwd) {
                        connection.query('UPDATE users set password="' + newpwd + '" WHERE id="' + userId + '"', function(err, rows, fields){
                            if(err){
                                console.log(err);
                                appData["error"] = 0;
                                appData["data"] = "error";
                                res.status(200).json(appData);
                                return;
                            }
                            appData["error"] = 1;
                            appData["data"] = "password is updated.";
                            res.status(200).json(appData);
                        });
                      } else {
                          appData.error = 1;
                          appData["data"] = "Password does not match";
                          res.status(204).json(appData);
                      }
                  } else {
                      appData.error = 1;
                      appData["data"] = "Email does not exists!";
                      res.status(204).json(appData);
                  }
                }
            });
            connection.release();
        }
    });
});

module.exports = users;