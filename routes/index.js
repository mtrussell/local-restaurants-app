const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// homepage
router.get('/', catchErrors(storeController.getStores));

// show all stores
router.get('/stores', catchErrors(storeController.getStores));

// add a store, first check if logged in
router.get('/add', 
  authController.isLoggedIn, 
  storeController.addStore
);

// edit a store
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

// create a store
router.post('/add', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

// update a store's image
router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

// show a single store
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

// show all stores filtered by tags
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

// login
router.get('/login', userController.loginForm);
router.post('/login', authController.login);

// register form, validate registration data, register, and login
router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
);

// logout
router.get('/logout', authController.logout);

// account page
router.get('/account', 
  authController.isLoggedIn, 
  userController.account
);

// update account
router.post('/account', catchErrors(userController.updateAccount));

// password reset
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
  authController.confirmedPasswords, 
  catchErrors(authController.update)
);

module.exports = router;
