const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed" }, false);
    }
  }
};

// home
exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

// add a store
exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

// user upload a photo to memory
exports.upload = multer(multerOptions).single('photo');

// resize user's photo and save to disc
exports.resize = async (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }
  // unique file name
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // keep going
  next();
};

// create a store
exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

// get all stores
exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores: stores} );
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

// edit a store
exports.editStore = async (req, res) => {
  // res.json(req.params);
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', { title: `Edit ${store.name}`, store: store });
}; 

// update a store
exports.updateStore = async (req, res) => {
  // set the location to be a point
  req.body.location.type = 'Point';
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, 
    {
    new: true,
    runValidators: true
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store.id}/edit`);
};

// get a single store
exports.getStoreBySlug = async (req, res, next) => {
  // res.json(req.params);
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if(!store) return next();
  res.render('showStore', { store: store });
};

// get stores by tags
exports.getStoresByTag = async (req, res) => {
  // if there is a tag only show stores with that tag, otherwise show all stores
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };

  // wait for the tagsPromise and the storesPromise 
  // then store the tags response and the stores response 
  // in the tags and stores respective variables
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tags', { tags, title: 'Title', tag, stores})
};