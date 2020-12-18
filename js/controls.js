$("body").swipe({
    swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
        //for player 1 only
        switch (direction) {
            case "up":
                board.movePlayer(1, "up");
                break;

            case "down":
                board.movePlayer(1, "down");
                break;

            case "left":
                board.movePlayer(1, "left");
                break;

            case "right":
                board.movePlayer(1, "right");
                break;
        }
    }
});

$(document).on('keydown', function(e) {
    switch (e.key) {
        //player 1
        case "ArrowLeft":
            board.movePlayer(1, "left");
            break;

        case "ArrowRight":
            board.movePlayer(1, "right");
            break;

        case "ArrowUp":
            board.movePlayer(1, "up");
            break;

        case "ArrowDown":
            board.movePlayer(1, "down");
            break;

        //player 2
        case "a":
        case "A":
            board.movePlayer(2, "left");
            break;

        case "d":
        case "D":
            board.movePlayer(2, "right");
            break;

        case "w":
        case "W":
            board.movePlayer(2, "up");
            break;

        case "s":
        case "S":
            board.movePlayer(2, "down");
            break;
    }
});