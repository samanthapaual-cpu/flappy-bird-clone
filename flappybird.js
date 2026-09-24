// board

let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let birdImgs = [];
let birdImgsIndex = 0;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // pipes moving left
let velocityY = 0; // for birds to fly
let gravity = 0.4;

let gameOver = false;
let gameStarted = false;
let score = 0;

let wingSound = new Audio("sounds/sfx_wing.wav");
let hitSound = new Audio("sounds/sfx_hit.wav");
let bgm = new Audio("sounds/bgm_mario.mp3");
bgm.loop = true;


// LOAD GAME
window.onload = function() {

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");


    // load bird images
    for (let i = 0; i < 4; i++) {
        let birdImg = new Image();
        birdImg.src = `images/images/flappybird${i}.png`;
        birdImgs.push(birdImg);
    }


    // load pipe images
    topPipeImg = new Image();
    topPipeImg.src = "images/images/toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "images/images/bottompipe.png";


    // keyboard
    document.addEventListener("keydown", moveBird);


    // MOBILE TAP
    board.addEventListener("touchstart", function(e) {
        e.preventDefault();
        if (!gameStarted) {
            return;
        }
        // Make mobile tap behave like pressing Space
        moveBird({
            code: "Space"
        });
    });

    // PLAY BUTTON
    let playButton = document.querySelector("button");
    playButton.addEventListener("click", startGame);

};

// START GAME
function startGame() {

    gameStarted = true;
    // hide instructions
    document.querySelector("p").style.display = "none";
    // hide play button
    document.querySelector("button").style.display = "none";

    // START YOUR ORIGINAL GAME
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    setInterval(animateBird, 100);
    bgm.play();
}


function update() {
    requestAnimationFrame(update);
    if (!gameStarted || gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // bird
    velocityY += gravity;

    bird.y = Math.max(bird.y + velocityY, 0);

    context.drawImage(
        birdImgs[birdImgsIndex],
        bird.x,
        bird.y,
        bird.width,
        bird.height
    );

    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;

        context.drawImage(
            pipe.img,
            pipe.x,
            pipe.y,
            pipe.width,
            pipe.height
        );

        // SCORE
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        // COLLISION
        if (detectCollision(bird, pipe)) {
            hitSound.play();
            gameOver = true;
        }
    }

    // clear pipes
    while (
        pipeArray.length > 0 &&
        pipeArray[0].x < -pipeWidth
    ) {
        pipeArray.shift();
    }

    // score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
        bgm.pause();
        bgm.currentTime = 0;
    }
}

function animateBird() {
    birdImgsIndex++;
    birdImgsIndex %= birdImgs.length;
}

function placePipes() {
    if (gameOver) {
        return;
    }

    // this formula makes the top pipe
    // randomly positioned
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };

    pipeArray.push(bottomPipe);

}

function moveBird(e) {
    if (!gameStarted) {
        return;
    }

    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        if (bgm.paused) {
            bgm.play();
        }

        wingSound.play();
        velocityY = -6;

        // reset the game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}