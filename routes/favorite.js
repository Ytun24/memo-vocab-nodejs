const express = require('express');

const favoriteController = require('../controllers/favorite');

const router = express.Router();

router.get('/', favoriteController.getFavorites);

router.post('/', favoriteController.postVocabToFavorite);

router.post('/delete-item', favoriteController.postFavoriteDeleteVocab);

router.post('/create-archive', favoriteController.postArchive);

router.get('/archives', favoriteController.getArchives);


module.exports = router;