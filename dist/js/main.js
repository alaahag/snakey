const preloadImage = function(url){
    const img=new Image();
    img.src = url;
    return img;
};

const APPLE = preloadImage("../images/apple.png");
const FIRE = preloadImage("../images/fire.gif");
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

const SOUNDS = {
    "collect": new Audio('audio/collect.mp3'),
    "game_over": new Audio('audio/game_over.mp3')
};

const fixedPageSize = function(){
    if ($(window).height() < $(window).width()) {
        const heightRatio = parseFloat(($(window).height()-36) * 0.04).toFixed(1);
        const width = Math.floor(parseFloat($(window).width() / heightRatio));
        $("#grid-container").css("grid-template-rows", `repeat(25, ${heightRatio}px)`).css("grid-template-columns", `repeat(${width}, ${heightRatio}px)`);
        return { width, height: 25 };
    }
    else {
        const widthRatio = parseFloat($(window).width() * 0.04).toFixed(1);
        const height = Math.floor((parseFloat($(window).height()-36) / widthRatio));
        $("#grid-container").css("grid-template-rows", `repeat(${height}, ${widthRatio}px)`).css("grid-template-columns", `repeat(25, ${widthRatio}px)`);
        return { width: 25, height };
    }
};

$(window).on("resize", function(){
    if (board.start) {
        if (!board.detectScreenChange) {
            board.detectScreenChange = true;
            alert("Screen size-change detected!\nThe game will automatically resize itself to fit your screen on next game-play.")
        }
    }
    else {
        const pageSize = fixedPageSize();
        board.col = pageSize.height;
        board.row = pageSize.width;
    }
});

$("#difficulty").on("change", function(){
    difficulty = this.selectedOptions[0].text.toLowerCase();
    updateScoreTable();
});

const updateScoreTable = async function(){
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
};

//important: if you change cell-sizes, make sure to modify also the styles grid
const board = new Snake(fixedPageSize());
$("#btn_one_player").on("click", function(){
    board.startGame(1);
});

$("#btn_two_player").on("click", function(){
    board.startGame(2);
});

$("#btn_play_again").on("click", function(){
    board.resetGame();
});

$("#form_submit_score").on("submit", async function(){
    const isUpdated = await $.post('/highscore', { score: board.player[1].score, difficulty: board.player[1].difficulty, name: $("#txt_submit_score").val(), snakeLength: board.player[1].snakeStack.length, boardCol: board.col, boardRow: board.row, fireCount: board.fireCount });
    if (isUpdated)
        await updateScoreTable();

    $("#btn_play_again").trigger("click");
    return false;
});

let difficulty = $("#difficulty option:selected").text().toLowerCase();
updateScoreTable();