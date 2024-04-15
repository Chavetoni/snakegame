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


// let snakeImage = new Image();
// snakeImage.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.w_fVe6t5UNxjKCGAR-BB8wHaFP%26pid%3DApi&f=1&ipt=f8b4bdeb95221df42df93b13b08781bae1f7e1f9797adb944f30b4079079659b&ipo=images";
// let foodImage = new Image();
// foodImage.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.explicit.bing.net%2Fth%3Fid%3DOIP.X6XJB75J66PKWUnvFKN0YQHaHa%26pid%3DApi&f=1&ipt=c320c8fb351b5d117f13757161584dd436473c2c48f95f7fe0e611078875e453&ipo=images";

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
    for(i = 0; i < snake.length; i++) {
        context.fillStyle = "green";
        context.fillRect(snake[i].x, snake[i].y, box, box);
        // context.drawImage(snakeImage, snake[i].x, snake[i].y, box, box);
    }
}

function drawFood() {
    context.fillStyle = "red";
    context.fillRect(food.x, food.y, box, box);
    // context.drawImage(foodImage, food.x, food.y, box, box);
}

function startGame() {
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

    if(direction == "right") snakeX += box;
    if(direction == "left") snakeX -= box;
    if(direction == "up") snakeY -= box;
    if(direction == "down") snakeY += box;

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

let game = setInterval(startGame, 350);
init();
