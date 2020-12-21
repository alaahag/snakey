const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const highScore = new Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    difficulty: { type: String, enum: [ "easy", "normal", "hard", "insane" ], required: true }
});

const Highscore = mongoose.model('Highscore', highScore, 'Highscores');

module.exports = Highscore;