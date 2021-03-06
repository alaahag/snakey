class Snake {
    constructor(boardSize) {
        this.start = false; //start or stop game
        this.detectScreenChange = false; //detect if user changed screen (resized) so we need to resize after game ends
        this.col = boardSize.width; //automatically calculated
        this.row= boardSize.height; //automatically calculated
        this.whiteSpace = "rgba(0, 0, 0, 0)"; //white color is the default white-space, DO NOT TOUCH
        this.p1Color = "rgb(254, 241, 37)"; //if u don't like the snake's box colors for player1, you can change it here
        this.p2Color = "rgb(192, 255, 0)"; //same for player2
        this.player = []; //object for player[1] + player[2]
        this.interval1 = null; //for player1
        this.interval2 = null; //for player2
        this.fireCount = 0; //counter for fire on screen (we need it for the backend validations)

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

    rebuildOnWindowResize() {
        $("#grid-container").empty();
        const newPageSize = fixedPageSize();
        this.col = newPageSize.width;
        this.row = newPageSize.height;
        this.generateCells(this.col, this.row);
        this.detectScreenChange = false;
    }

    startGame(playersNum=1) {
        //reset cells and rebuild them on screen size change
        if (this.detectScreenChange)
            this.rebuildOnWindowResize();

        this.generateFire();

        $("#menu").fadeOut();
        $("#score_p1").text("0");

        this.speed = $("#difficulty").find(":selected").val();

        $("#label_p1").text("Score: ");
        $("#label_p2_or_highest").text("Best: ");
        this.initPlayer(1);
        this.interval1 = setInterval(() => { this.autoMove(1); }, this.speed);

        if (playersNum === 2) {
            $("#label_p1").text("P1 Score: ");
            $("#label_p2_or_highest").text("P2 Score: ");
            $("#score_p2_or_highest").text("0");
            this.initPlayer(2);
            this.interval2 = setInterval(() => { this.autoMove(2); }, this.speed);
        }
        else {
            //on solo play only
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
        this.fireCount = 0;
        this.start = false;
    }

    gameOver() {
        SOUNDS.game_over.play();
        clearInterval(this.interval1);
        clearInterval(this.interval2);
        $("#game_over").fadeIn();
        if (this.player[2]) {
            //no top 3 best scores for multiplayer
            $("#txt_submit_score").prop('disabled', true);
            $("button:submit").prop('disabled', true);
            $("ol").css("text-decoration", "line-through");
            $(".top_scores").css("text-decoration", "line-through");
            $("#highest_scores_title").text("Unrated Game");
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
            if (checkFreeCell.css("background-color") === this.whiteSpace && checkFreeCell.css("background-image") === "none") {
                checkFreeCell.css("background-image", "url(" + APPLE.src + ")");
                break;
            }
        }
    }

    generateFire() {
        //generate fire borders on screen
        for (let row=Math.floor(parseFloat(this.row * 0.3)); row<Math.floor(parseFloat(this.row * 0.7)); row+=3) {
            for (let col=Math.floor(parseFloat(this.col * 0.3)); col<Math.floor(parseFloat(this.col * 0.7)); col+=3) {
                const checkFreeCell = $(`.c${col}_${row}`);
                if (checkFreeCell.css("background-color") === this.whiteSpace && checkFreeCell.css("background-image") === "none") {
                    checkFreeCell.css("background-image", "url(" + FIRE.src + ")");
                    this.fireCount++;
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
        const img = this.player[playerNum].snakeStack[head].css("background-image");

        //detect hitting borders or snakes or fire (game over)
        if (this.player[playerNum].pos.col < 0 || this.player[playerNum].pos.col > this.col-1 ||
            this.player[playerNum].pos.row < 0 || this.player[playerNum].pos.row > this.row-1 ||
            img.includes(FIRE.src) ||
            this.player[playerNum].snakeStack[head].css("background-color") !== this.whiteSpace) {
                this.gameOver();
                return -1;
        }
        else if (img.includes(APPLE.src)) {
            //if touched apple, we collect it
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

            //default values if no args
            if (pos === undefined)
                pos = { col: this.col-2, row: this.row-2 };

            if (dir === undefined)
                dir = "left";
        }
        else if(playerNum === 2) {
            playerColor = this.p2Color;

            //default values if no args
            if (pos === undefined)
                pos = { col: 1, row: 1 };

            if (dir === undefined)
                dir = "right";
        }
        else
            return;

        const currentPlayerPos = $(`.c${pos.col}_${pos.row}`);
        let nextCellCoords = this.moveHead(pos, dir);

        currentPlayerPos.css("background-color", playerColor);
        const newPosition = $(`.c${nextCellCoords.col}_${nextCellCoords.row}`);
        newPosition.css("background-image", "url(" + HEADS[nextCellCoords.head + playerNum].src + ")");
        this.player[playerNum] = {score: 0, pos: {col: nextCellCoords.col, row: nextCellCoords.row}, dir: dir, snakeStack: [currentPlayerPos, newPosition], pColor: playerColor};
    }

    moveHead(pos, dir) {
        let position;
        switch (dir) {
            case "left":
                position = { col: pos.col-1, row: pos.row, head: "head_left" };
                break;

            case "right":
                position = { col: pos.col+1, row: pos.row, head: "head_right" };
                break;

            case "up":
                position = { col: pos.col, row: pos.row - 1, head: "head_up" };
                break;

            //down
            default:
                position = { col: pos.col, row: pos.row + 1, head: "head_down" };
        }

        return position;
    }

    removeTail(playerNum) {
        //remove snake tail
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

        //0 = not eaten apple, 1 = eaten apple, -1 = game over
        if (isAppleEaten !== -1) {
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

        //this will prevent you from killing yourself accidentally
        if  ((dir === "left" && this.player[playerNum].dir === "right") ||
            (dir === "right" && this.player[playerNum].dir === "left") ||
            (dir === "up" && this.player[playerNum].dir === "down") ||
            (dir === "down" && this.player[playerNum].dir === "up"))
                return;

        this.player[playerNum].dir = dir;
    }
}