const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


// login page
exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

// registration page
exports.registerForm = (req, res) => {
  res.render('register', { title: 'Sign Up' });
};

// sanitize and validate all the registration input fields
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match.').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running and exit
  }
  next(); // there were no errors! go on to register the user
};

// register the user, save to database
exports.register = async (req, res, next) => {
  const user = new User({ name: req.body.name, email: req.body.email });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next();
};


exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    //query
    { _id: req.user._id },
    //updates
    { $set: updates },
    //options
    { new: true, runValidators: true, context: 'query' }
  );

  // use res.redirect('/wherever') to send them wherever you like
  req.flash('success', 'Updated the profile!');
  res.redirect('back');
};