const express = require('express');
const router = express.Router();
const Highscore = require('../models/Highscore.js');
const ENUM_DIFFICULTY = [ "easy", "normal", "hard", "insane" ];

// router.get('/sanity', function(req, res) {
// 	//200 = OK
// 	res.sendStatus(200);
// });

router.get('/highscores/:difficulty', async function(req, res){
	const difficulty = req.params.difficulty;
	try {
		if (ENUM_DIFFICULTY.indexOf(difficulty) !== -1) {
			const highScores = await Highscore.find({ difficulty }).limit(3).sort({ score: -1 });
			res.send(highScores);
		}
		else {
			res.send(null);
		}
	}
	catch (error) {
		console.log(error);
		res.send(null);
	}
});

router.post('/highscore', async function(req, res){
	//should get: score, difficulty, name, snakeLength, boardCol, boardRow
	//required only: score, difficulty, name
	const highScore = new Highscore({ ...req.body });
	highScore.name.replace(new RegExp('[^a-zA-Z0-9_. )(&-]', 'g'), "").trim();

	const snakeLength = req.body.snakeLength;
	const boardCol = req.body.boardCol;
	const boardRow = req.body.boardRow;
	const fireCount = req.body.fireCount;

	if (highScore.name.length < 1 || highScore.name.length > 10)
		highScore.name = "Unknown";

	//ANTI CHEAT
	if (ENUM_DIFFICULTY.indexOf(highScore.difficulty) === -1 || !highScore.score || !snakeLength || !boardCol || !boardRow || !fireCount ) {
		res.send(null);
		return;
	}

	try {
		//calculate if legal score and save to DB (ANTI CHEAT)
		if (highScore.score === (snakeLength -3) * 10 && highScore.score <= boardCol * boardRow - fireCount) {
			await highScore.save();
			res.send(req.body);
		}
		else
			res.send(null);
	}
	catch (error) {
		console.log(error);
		res.send(null);
	}
});

module.exports = router;