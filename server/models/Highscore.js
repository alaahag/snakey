const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const highScore = new Schema({
    name: {type: String, required: true},
    score: {type: Number, required: true}
});

const Highscore = mongoose.model('Highscore', highScore, 'Highscores');

module.exports = Highscore;