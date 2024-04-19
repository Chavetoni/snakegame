let canvas = document.getElementById('game');
let context = canvas.getContext('2d');
let video = document.getElementById('videoElement');
let score = 0;
let useCamera = false;

document.getElementById('toggle').addEventListener('change', (event) => {
    useCamera = event.target.checked;
})

document.addEventListener('keydown', (event) => {
    if(!useCamera) {
        switch (event.key) {
            case 'ArrowUp':
              if (direction !== 'down') {
                direction = 'up';
              }
              break;
            case 'ArrowDown':
              if (direction !== 'up') {
                direction = 'down';
              }
              break;
            case 'ArrowLeft':
              if (direction !== 'right') {
                direction = 'left';
              }
              break;
            case 'ArrowRight':
              if (direction !== 'left') {
                direction = 'right';
              }
              break;
            default:
              break;
          }
    }
})

function preloadImages(callback) {
    const imageSources = [
        'images/headsnake-up.webp',
        'images/headsnake-down.webp',
        'images/headsnake-left.webp',
        'images/headsnake-right.webp',
        'images/snakebody-up.webp',
        'images/snakebody-down.webp',
        'images/snakebody-left.webp',
        'images/snakebody-right.webp',
        

    ]


    let loadedCount = 0;
    const totalImages = imageSources.length;

    imageSources.forEach((src) => {
        const image = new Image();
        image.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
        image.src = src;
    });

}

preloadImages(() => {
    requestAnimationFrame(gameLoop);
});


let box = 32;
let snake = [];
snake[0] = {
    x: 8 * box,
    y: 8 * box
};

let direction = "right";
let food = {
    x: Math.floor(Math.random() * 15 + 1) * box,
    y: Math.floor(Math.random() * 15 + 1) * box
};

// Set up webcam
let webcam, labelContainer, maxPredictions;

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        video.srcObject = stream;
    })
    .catch(function (error) {
        console.log("Something went wrong!");
    });
}

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/WljeuKE2-/";

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    webcam = new tmImage.Webcam(200, 200); 
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);
    
    labelContainer = document.getElementById('label-container');
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let highestConfidence = 0;
    let highestLabel = '';

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestConfidence) {
            highestConfidence = prediction[i].probability;
            highestLabel = prediction[i].className;
        }
    }

    switch (highestLabel) {
        case 'up':
            if (direction !== 'down') {
                direction = 'up';
            }
            break;
        case 'down':
            if (direction !== 'up') {
                direction = 'down';
            }
            break;
        case 'left':
            if (direction !== 'right') {
                direction = 'left';
            }
            break;
        case 'right':
            if (direction !== 'left') {
                direction = 'right';
            }
            break;
        default:
            break;
    }
}

function createBackground() {
    context.fillStyle = "lightgreen";
    context.fillRect(0, 0, 16 * box, 16 * box);
}

function createSnake() {
    for(let i = 0; i < snake.length; i++) {
        let snakePart = snake[i];
        let image;

        if ( i === 0){
            //Draw the snake head based on directions
            image = getSnakeHeadImage(direction);
        } else {
            //Draw the snake body
            let prevPart = snake[i - 1];
            let currentPart = snake[i];
            let bodyDirection = getBodyDirection(prevPart, currentPart);
            image = getSnakeBodyImage(bodyDirection);
        }
        context.drawImage(image, snakePart.x, snakePart.y, box, box);
    }

    }

function getBodyDirection(prevPart, currentPart) {
        if(prevPart.x === currentPart.x){
            return prevPart.y < currentPart.y ? 'down' : 'up';
        }
        else{
            return prevPart.x < currentPart.x ? 'left' : 'right';
        }
    }

function getSnakeBodyImage(bodyDirection) {
    let image = new Image();
      switch (bodyDirection) {
        case 'up':
            image.src = 'images/snakebody-up.webp';
            break;
        case 'down':
            image.src = 'images/snakebody-down.webp';
            break;
        case 'left':
            image.src = 'images/snakebody-left.webp';
            break;
        case 'right':
            image.src = 'images/snakebody-right.webp';
            break;
    }
    return image;
}

function getSnakeHeadImage(direction) {
        let image = new Image();    
        switch (direction) {
            case 'up':
                image.src = 'images/headsnake-up.webp';
                break;
            case 'down':
                image.src = 'images/headsnake-down.webp';
                break;
            case 'left':
                image.src = 'images/headsnake-left.webp';
                break;
            case 'right':
                image.src = 'images/headsnake-right.webp';
                break;
            default:
                image.src = 'images/headsnake.webp'; // Default case, can be the front facing head or any one head direction
                break;
        }
        return image;
    }
    


function drawFood() {
    context.fillStyle = "red";
    context.fillRect(food.x, food.y, box, box);
   
    
}


let lastTimestamp = 0;
const targetFPS = 5;

function gameLoop(timestamp) {
    if (timestamp-lastTimestamp >= 1000 / targetFPS) {
        startGame();
        lastTimestamp = timestamp
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop)

function startGame() {
    console.log("game tick");

    if(snake[0].x > 15 * box && direction == "right") snake[0].x = 0;
    if(snake[0].x < 0 && direction == "left") snake[0].x = 16 * box;
    if(snake[0].y > 15 * box && direction == "down") snake[0].y = 0;
    if(snake[0].y < 0 && direction == "up") snake[0].y = 16 * box;

    for(i = 1; i < snake.length; i++) {
        if(snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
            clearInterval(game);
            alert('Game Over :(');
        }
    }

    createBackground();
    createSnake();
    drawFood();

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    switch (direction) {
        case 'right':
            snakeX += box;
            break;
        case 'left':
            snakeX -= box;
            break;
        case 'up':
            snakeY -= box;
            break;
        case 'down':
            snakeY += box;
            break;
    }

    if(snakeX != food.x || snakeY != food.y){
        snake.pop();
    } else {
        food.x = Math.floor(Math.random() * 15 + 1) * box;
        food.y = Math.floor(Math.random() * 15 + 1) * box;
        score++;
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    }

    snake.unshift(newHead);
    
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText("Score: " + score, box, box);
}


init();
