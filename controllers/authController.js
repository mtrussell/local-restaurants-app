const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');


// login the user
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});


// logout the user
exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};


// check if the user is logged in
exports.isLoggedIn = (req, res, next) => {
  // check if the user is authenticated
  if(req.isAuthenticated()) {
    next(); // carry on! they are logged in!
    return;
  }

  req.flash('error', 'Oops! You must be logged in to do that.');
  res.redirect('/login');
};


// forgot password
exports.forgot = async (req, res) => {
  // 1. see if a user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No acccount with that email exists!');
    return res.redirect('/login');
  }
  // 2. set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // One hour from now
  await user.save();
  // 3. send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  mail.send({
    user: user,
    subject: 'Password reset',
    resetURL: resetURL,
    filename: 'password-reset'
  });
  req.flash('success', `You have been emailed a password reset link.`);
  // 4. redirect to login page
  res.redirect('/login');
};


// reset password form
exports.reset = async (req, res) => {
  //res.json(req.params);
  // mongodb $gt means 'greater than'
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  
  res.render('reset', { title: 'Reset your password' });
};


// confirm reset password match
exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next(); // keep going!
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};


// update reset password
exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // promisify passport's setPassword method and bind it to 'user'
  // then call setPassword with the new validated password
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  // set the resetPasswordToken and resetPasswordExpires fields to undefined
  // mongodb will remove them if 'undefined'
  // save the updated user object to updatedUser
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  // login the updatedUser with passport.js's req.login method
  await req.login(updatedUser);

  req.flash('success', 'Nice! Your password has been reset. You are now logged in!');

  res.redirect('/');
};