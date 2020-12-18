const sounds = {
    "collect": new Audio('audio/collect.mp3'),
    "game_over": new Audio('audio/game_over.mp3')
};

const fixedPageSize = function() {
    const grid = $("#grid-container");
    const fixedScreen = $(window).height() < $(window).width() ? $(window).height() : $(window).width();
    grid.css("width", fixedScreen);
    grid.css("height", fixedScreen);
    $("header").css("width", fixedScreen);
    return grid;
};

const preloadImage = function(url) {
    const img=new Image();
    img.src = url;
    return img;
};

const SYMBOL = preloadImage("../images/apple.png");

$(window).on("resize", function() {
    fixedPageSize();
});

fixedPageSize();

//important: if you change cell-sizes, make sure to modify also the styles grid
const board = new Snake(25);
$("#btn_one_player").on("click", function() {
    board.startGame(1);
});

$("#btn_two_player").on("click", function() {
    board.startGame(2);
});

$("#btn_play_again").on("click", function() {
    board.resetGame();
});