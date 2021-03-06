var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../config/secrets');

// Web pages
/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
      .findOne({ resetPasswordToken: req.params.token })
      .where('resetPasswordExpires').gt(Date.now())
      .exec(function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('/forgot');
        }
        res.render('account/reset', {
          title: 'Password Reset'
        });
      });
};

/**
 * new index page for login
 */
exports.newLoginHttp = function(req, res) {
  console.log(__dirname);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
  res.setHeader('Access-Control-Allow-Credential', true);
  res.sendFile(__dirname + '/html/newlogin.html', function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('new login page');
    }
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};
















/* ================ RESTful APIs ================ */

/**
 * GET /logout
 * Log out.
 */
exports.logout = function(req, res) {
  if (req.user) {
    req.logout();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
    res.setHeader('Access-Control-Allow-Credential', true);
    res.send({success: 'user is logged out'});
    return;
  }
  res.status(400).send({error: 'please login'});
};

/**
 * GET /login
 * Login information.
 */
exports.getLogin = function(req, res) {
  if (req.user) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
    res.setHeader('Access-Control-Allow-Credential', true);
    res.send({success: 'user was already logged in', token: req.user.password});
    return;
  }
  res.status(400).send({error: 'please login'});
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = function(req, res) {
  req.assert('email', 'email is invalid').isEmail();
  if (req.validationErrors()) {
    res.status(400).send({error: 'email is invalid'});
    return;
  }

  req.assert('password', 'password is blank').notEmpty();
  if (req.validationErrors()) {
    res.status(400).send({error: 'password is blank'});
    return;
  }

  passport.authenticate('local', function(err, user) {
    if (err || !user) {
      res.status(400).send({error: 'password is wrong'});
      return;
    }
    req.logIn(user, function(err) {
      if (err) {
        res.status(400).send({error: 'login error'});
        return;
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
      res.setHeader('Access-Control-Allow-Credential', true);
      res.send({success: 'user is logged in', token: user.password});
    });
  })(req, res);
};


/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = function(req, res) {
  req.assert('email', 'email is invalid').isEmail();
  if (req.validationErrors()) {
    res.status(400).send({error: 'email is invalid'});
    return;
  }
  req.assert('password', 'password is not longer than 4 characters').len(4);
  if (req.validationErrors()) {
    res.status(400).send({error: 'password is not longer than 4 characters'});
    return;
  }
  req.assert('confirmPassword', 'confirm passwords do not match').equals(req.body.password);
  if (req.validationErrors()) {
    res.status(400).send({error: 'confirm passwords do not match'});
    return;
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      res.status(400).send({error: 'email already exists'});
      return;
    }
    user.save(function(err) {
      if (err) {
        res.status(400).send({error: 'create account error'});
        return;
      }
      req.logIn(user, function(err) {
        if (err) {
          res.status(400).send({error: 'login error'});
          return;
        }
        res.send({success: 'user is created and logged in', token: req.user.password});
      });
    });
  });
};



/**
 * GET /account
 */
exports.getAccount = function(req, res) {
  User.findById(req.user.id,
      {
        _id: 1,
        email: 1,
        profile: 1,
        likedElement: 1,
        likedPost: 1
      }, function(err, user) {
    if (!err && user) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
      res.setHeader('Access-Control-Allow-Credential', true);
      res.send(JSON.parse(JSON.stringify(user)));
    } else {
      res.status(400).send({error: 'user is not found'});
    }
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = function(req, res) {
  User.findById(req.user.id, function(err, user) {
    if (err) {
      res.status(400).send({error: 'user is not found'});
      return;
    }
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';

    user.save(function(err) {
      if (err) {
        res.status(400).send({error: 'saving profile error'});
        return;
      }
      res.send({success: 'account profile is updated'});
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = function(req, res) {
  req.assert('password', 'password is not longer than 4 characters').len(4);
  if (req.validationErrors()) {
    res.status(400).send({error: 'password is not longer than 4 characters'});
    return;
  }
  req.assert('confirmPassword', 'confirm passwords do not match').equals(req.body.password);
  if (req.validationErrors()) {
    res.status(400).send({error: 'confirm passwords do not match'});
    return;
  }
  User.findById(req.user.id, function(err, user) {
    if (err) {
      res.status(400).send({error: 'user is not found'});
      return;
    }

    user.password = req.body.password;

    user.save(function(err) {
      if (err) {
        res.status(400).send({error: 'change password error'});
        return;
      }
      res.send({success: 'password is updated'});
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = function(req, res) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) {
      res.status(400).send({error: 'delete account error'});
      return;
    }
    req.logout();
    res.send({success: 'account is deleted'});
  });
};



/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      req.flash('info', { msg: provider + ' account has been unlinked.' });
      res.redirect('/account');
    });
  });
};



/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that email address exists.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};


