const preloadImage = function(url) {
    const img=new Image();
    img.src = url;
    return img;
};

const SYMBOL = preloadImage("../images/apple.png");
const HEADS = {
            head_down1: preloadImage("../images/head_down1.png"),
            head_down2: preloadImage("../images/head_down2.png"),
            head_up1: preloadImage("../images/head_up1.png"),
            head_up2: preloadImage("../images/head_up2.png"),
            head_left1: preloadImage("../images/head_left1.png"),
            head_left2: preloadImage("../images/head_left2.png"),
            head_right1: preloadImage("../images/head_right1.png"),
            head_right2: preloadImage("../images/head_right2.png")
};

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

$(window).on("resize", function() {
    fixedPageSize();
});

$("#difficulty").on("change", function() {
    difficulty = this.selectedOptions[0].text.toLowerCase();
    updateScoreTable();
});

const updateScoreTable = async function() {
    try {
        const res = await $.get(`/highscores/${difficulty}`);
        $("#label_p2_or_highest").text("Best: ");
        $("#score_p2_or_highest").text(res[0] ? res[0].score : 0);
        $("#difficulty_mode").text(difficulty);

        //fill top scores table
        const ol = $("ol").empty();
        for (let i=0; i<3; i++) {
            if (res[i])
                ol.append(`<li><span>${res[i].name}</span><span class="top_scores">${res[i].score}</span></li>`);
            else
                ol.append('<li><span>null</span><span class="top_scores">0</span></li>');
        }
    }
    catch {}
};

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

$("#form_submit_score").on("submit", async function() {
    const isUpdated = await $.post('/highscore', {score: board.player[1].score, difficulty: board.player[1].difficulty, name: $("#txt_submit_score").val(), snake_stacks: board.player[1].snakeStack.length, board_size: board.col_row});
    if (isUpdated)
        await updateScoreTable();

    $("#btn_play_again").trigger("click");
    return false;
});

let difficulty = $("#difficulty option:selected").text().toLowerCase();
updateScoreTable();