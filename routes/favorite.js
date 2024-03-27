const express = require('express');

const favoriteController = require('../controllers/favorite');

const router = express.Router();

router.get('/', favoriteController.getFavorites);

router.post('/', favoriteController.postVocabToFavorite);

router.post('/delete-item', favoriteController.postFavoriteDeleteVocab);
module.exports = router;