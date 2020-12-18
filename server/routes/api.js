const express = require('express');
const router = express.Router();
const Highscore = require('../models/Highscore.js');

/* SANITY CHECK */
router.get('/sanity', function(req, res) {
	//200 = OK
	res.sendStatus(200);
});
/* END OF SANITY CHECK */

router.get('/highscores', function(req, res) {
	res.send(null);
});

router.post('/highscores', async function(req, res) {
	try {
		const highScore = new Highscore({ ...req.body });
		//await book.save();
		res.send(null);
	}
	catch (error) {
		console.log(error);
		res.send(null);
	}
});

module.exports = router;