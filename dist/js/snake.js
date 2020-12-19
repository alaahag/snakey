class Snake {
    constructor(boardSize) {
        this.start = false;
        this.col = boardSize.width;
        this.row= boardSize.height;
        this.whiteSpace = "rgba(0, 0, 0, 0)"; //white color is the default white-space
        this.p1Color = "rgb(201, 190, 12)"; //if u don't like the snake's box colors, you can change it only here
        this.p2Color = "rgb(191, 234, 82)"; //if u don't like the snake's box colors, you can change it only here
        this.player = []; //for player[1] + player[2]
        this.interval1 = null;  //for each player
        this.interval2 = null;

        this.generateCells(this.col, this.row);
    }

    generateCells(colNum, rowNum) {
        for (let row=0; row<rowNum; row++) {
            for (let col=0; col<colNum; col++) {
                $("#grid-container").append(`<div class="cell c${col}_${row}"></div>`);
            }
        }
    }

    initPlayer(playerNum) {
        this.createPlayer(playerNum);
        this.createApple();
    }

    startGame(playersNum=1) {
        $("#menu").fadeOut();
        $("#score_p1").text("0");

        this.modifySpeed($("#difficulty").find(":selected").val());

        $("#label_p1").text("Score: ");
        $("#label_p2_or_highest").text("Best: ");
        this.initPlayer(1);
        this.interval1 = setInterval(() => {this.autoMove(1);}, this.speed);

        if (playersNum === 2) {
            $("#label_p1").text("P1 Score: ");
            $("#label_p2_or_highest").text("P2 Score: ");
            $("#score_p2_or_highest").text("0");
            this.initPlayer(2);
            this.interval2 = setInterval(() => {this.autoMove(2);}, this.speed);
        }
        else {
            //on solo only
            this.player[1].difficulty = $("#difficulty option:selected").text().toLowerCase();
            updateScoreTable();
        }

        this.start = true;
    }

    resetGame() {
        $("#game_over").fadeOut();
        $("#menu").fadeIn();
        $(".cell").css("background-color", "rgba(0, 0, 0, 0)").css("background-image", "none");
        delete this.player;
        this.player = [];
        this.start = false;
    }

    gameOver() {
        SOUNDS.game_over.play();
        clearInterval(this.interval1);
        clearInterval(this.interval2);
        $("#game_over").fadeIn();
        if (this.player[2]) {
            //no top scores for multiplayer
            $("#txt_submit_score").prop('disabled', true);
            $("button:submit").prop('disabled', true);
            $("ol").css("text-decoration", "line-through");
            $(".top_scores").css("text-decoration", "line-through");
            $("#highest_scores_title").text("Unranked Game");
        }
        else {
            const topScores = $(".top_scores");
            if (this.player[1].score > 0 && this.player[1].score >= topScores[topScores.length-1].innerText) {
                $("#txt_submit_score").prop('disabled', false);
                $("button:submit").prop('disabled', false);
            }
            else {
                $("#txt_submit_score").prop('disabled', true);
                $("button:submit").prop('disabled', true);
            }
            $("ol").css("text-decoration", "none");
            $("#highest_scores_title").html(`Top 3 on <span id="difficulty_mode">${this.player[1].difficulty}</span>-mode`);
        }
    }

    createApple() {
        //generate random apple and put it on screen
        let checkFreeCell;
        while (true) {
            const col = Math.floor(Math.random() * this.col);
            const row = Math.floor(Math.random() * this.row);
            checkFreeCell = $(`.c${col}_${row}`);
            if (checkFreeCell.css("background-color") === this.whiteSpace) {
                if (checkFreeCell.css("background-image") === "none") {
                    checkFreeCell.css("background-image", "url(" + SYMBOL.src + ")");
                    break;
                }
            }
        }
    }

    updateScore(playerNum) {
        this.player[playerNum].score += 10;

        let pSpan;
        if (playerNum === 1)
            pSpan =$("#score_p1");
        else
            pSpan =$("#score_p2_or_highest");

        pSpan.text(this.player[playerNum].score);
        SOUNDS.collect.play();
    }

    checkCollision(playerNum) {
        const head = this.player[playerNum].snakeStack.length-1;

        //detect hitting borders or snakes (game over)
        if (this.player[playerNum].pos.col < 0 || this.player[playerNum].pos.col > this.col-1 ||
            this.player[playerNum].pos.row < 0 || this.player[playerNum].pos.row > this.row-1 ||
            this.player[playerNum].snakeStack[head].css("background-color") !== this.whiteSpace) {
                this.gameOver();
                return -1;
            }

        //detect apple (collect and add a new random apple on screen and increase snake length)
        if (this.player[playerNum].snakeStack[head].css("background-image") !== "none") {
            this.player[playerNum].snakeStack[head].css("background-image", "none");
            this.updateScore(playerNum);
            this.createApple();
            return 1;
        }

        return 0;
    }

    createPlayer(playerNum, pos, dir) {
        let playerColor;
        if (playerNum === 1) {
            playerColor = this.p1Color;

            //default values if not sent to the method:
            if (pos === undefined)
                pos = {col: this.col-2, row: this.row-2};

            if (dir === undefined)
                dir = "left";
        }
        else if(playerNum === 2) {
            playerColor = this.p2Color;

            //default values if not sent to the method:
            if (pos === undefined)
                pos = {col: 1, row: 1};

            if (dir === undefined)
                dir = "right";
        }
        else
            return;

        const currentPlayerPos = $(`.c${pos.col}_${pos.row}`);
        let newHeadPos = this.moveHead(pos, dir);

        currentPlayerPos.css("background-color", playerColor);
        const newPosition = $(`.c${newHeadPos.col}_${newHeadPos.row}`);
        newPosition.css("background-color", playerColor);
        this.player[playerNum] = {score: 0, pos: {col: newHeadPos.col, row: newHeadPos.row}, dir: dir, snakeStack: [currentPlayerPos, newPosition], pColor: playerColor};
    }

    moveHead(pos, dir) {
        let position;
        switch (dir) {
            case "left":
                position = {col: pos.col-1, row: pos.row, head: "head_left"};
                break;

            case "right":
                position = {col: pos.col+1, row: pos.row, head: "head_right"};
                break;

            case "up":
                position = {col: pos.col, row: pos.row - 1, head: "head_up"};
                break;

            //down
            default:
                position = {col: pos.col, row: pos.row + 1, head: "head_down"};
        }

        return position;
    }

    removeTail(playerNum) {
        this.player[playerNum].snakeStack[0].css("background-color", this.whiteSpace);
        this.player[playerNum].snakeStack.shift();
    }

    autoMove(playerNum) {
        $(`.c${this.player[playerNum].pos.col}_${this.player[playerNum].pos.row}`).css("background-image", "none").css("background-color", this.player[playerNum].pColor);
        const nextCellCoords = this.moveHead(this.player[playerNum].pos, this.player[playerNum].dir);
        const newPosition = $(`.c${nextCellCoords.col}_${nextCellCoords.row}`);
        this.player[playerNum].snakeStack.push(newPosition);
        this.player[playerNum].pos.col = nextCellCoords.col;
        this.player[playerNum].pos.row = nextCellCoords.row;
        const isAppleEaten = this.checkCollision(playerNum);
        if (isAppleEaten !== -1) { //0 = not eaten apple, 1 = eaten apple, -1 = game over
            newPosition.css("background-image", "url(" + HEADS[nextCellCoords.head + playerNum].src + ")");
            if (isAppleEaten === 0)
                this.removeTail(playerNum);
        }
    }

    movePlayer(playerNum, dir) {
        //don't let the player play if the game is not started yet
        //don't let the player to spam press on same direction key
        if (this.player[playerNum] === undefined || this.player[playerNum].dir === dir || !this.start)
            return;

        //so you don't kill yourself accidentally
        if  ((dir === "left" && this.player[playerNum].dir === "right") ||
            (dir === "right" && this.player[playerNum].dir === "left") ||
            (dir === "up" && this.player[playerNum].dir === "down") ||
            (dir === "down" && this.player[playerNum].dir === "up"))
                return;

        this.player[playerNum].dir = dir;
    }

    modifySpeed(speed) {
        this.speed = speed;
    }
}