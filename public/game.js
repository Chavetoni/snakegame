let canvas = document.getElementById('game');
let context = canvas.getContext('2d');
let video = document.getElementById('videoElement');
let score = 0;
let useCamera = false;
let loadedImages = {};
let backgroundImage;

document.getElementById('toggle').addEventListener('change', (event) => {
    useCamera = event.target.checked;
})

document.addEventListener('keydown', (event) => {
    const oldDirection = direction;
    switch(event.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
    if (direction !== oldDirection) console.log('Direction changed to:', direction);
});

function preloadImages(callback) {
    const imageSources = {
        'head-up': 'images/headsnake-up.png',
        'head-down': 'images/headsnake-down.png',
        'head-left': 'images/headsnake-left.png',
        'head-right': 'images/headsnake-right.png',
        'body-up': 'images/snakebody-up.png',
        'body-down': 'images/snakebody-down.png',
        'body-left': 'images/snakebody-left.png',
        'body-right': 'images/snakebody-right.png',
        'background': 'images/background.jpg',
    };

    let imagesToLoad = Object.keys(imageSources).length;
    let imagesLoaded = 0;

    Object.entries(imageSources).forEach(([key, src]) => {
        const image = new Image();
        image.onload = () => {
            console.log(`loaded ${src} succesffully`);
            loadedImages[key] = image;
            imagesLoaded++;
            if (imagesLoaded === imagesToLoad) {
                callback();  // Only call the callback once all images have loaded
            }
        };
        image.onerror = () => {
            console.error("Failed to load image", src);
            imagesLoaded++;
            if ( imagesLoaded === imagesToLoad) {
                callback();
            }
        };
        image.src = src;
    });
    
}
preloadImages(() => {
    init();
    requestAnimationFrame(gameLoop); // start the game loop when all images are loaded
});




let box = 32;
let snake = [{x:8 * box, y:8 *box}];
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
// const URL = "https://teachablemachine.withgoogle.com/models/WljeuKE2-/";

async function init() {
    // const modelURL = URL + "model.json";
    // const metadataURL = URL + "metadata.json";
    
    // model = await tmImage.load(modelURL, metadataURL);
    // maxPredictions = model.getTotalClasses();
    
    webcam = new tmImage.Webcam(200, 200); 
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);
    
    // labelContainer = document.getElementById('label-container');
    // for (let i = 0; i < maxPredictions; i++) {
    //     labelContainer.appendChild(document.createElement("div"));
    // }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

// async function predict() {
//     const prediction = await model.predict(webcam.canvas);
//     let highestConfidence = 0;
//     let highestLabel = '';

//     for (let i = 0; i < maxPredictions; i++) {
//         if (prediction[i].probability > highestConfidence) {
//             highestConfidence = prediction[i].probability;
//             highestLabel = prediction[i].className;
//         }
//     }

//     switch (highestLabel) {
//         case 'up':
//             if (direction !== 'down') {
//                 direction = 'up';
//             }
//             break;
//         case 'down':
//             if (direction !== 'up') {
//                 direction = 'down';
//             }
//             break;
//         case 'left':
//             if (direction !== 'right') {
//                 direction = 'left';
//             }
//             break;
//         case 'right':
//             if (direction !== 'left') {
//                 direction = 'right';
//             }
//             break;
//         default:
//             break;
//     }
// }

function createBackground() {
    if (loadedImages['background']) {
        context.drawImage(loadedImages['background'], 0, 0, canvas.width, canvas.height);
    } else {
        context.fillStyle = "lightgreen";
        context.fillRect(0, 0, 16 * box, 16 * box);
    }
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

        if (image) {
            context.drawImage(image, snakePart.x, snakePart.y, box, box);
        } else {
            context.fillStyle = 'green';
            context.fillRect(snakePart.x, snakePart.y, box, box);
        }
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


function getSnakeHeadImage(direction) {
    let key = `head-${direction}`;
    if (!loadedImages[key]) {
        console.error(`Image not loaded for direction ${direction}`);
        return null
    }
    
    return loadedImages[key];
}

function getSnakeBodyImage(bodyDirection) {
    let key = `body-${bodyDirection}`;
    if (!loadedImages[key]) {
        console.error(`Image not loaded for body direction ${bodyDirection}`);
        return null;  // Return null or a default image if the expected image isn't loaded
    }
    return loadedImages[key];
}

    


function drawFood() {
    context.fillStyle = "red";
    context.fillRect(food.x, food.y, box, box);
   
    
}

function update() {
    if (snake[0].x > 15 * box && direction == 'right') snake[0].x = 0;
    if (snake[0].x < 0 && direction == 'left') snake[0].x = 16 * box;
    if (snake[0].y > 15 * box && direction == 'down') snake[0].y = 0;
    if (snake[0].y < 0 && direction == 'up') snake[0].y = 16 * box;

    for (i=1; i < snake.length; i++) {
        if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
            alert('Game Over :(');
            return;
        }
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y

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

    if (snakeX != food.x || snakeY != food.y) {
        snake.pop();
    }else {
        food.x = Math.floor(Math.random() * 15 + 1) * box;
        food.y = Math.floor(Math.random() * 15 + 1 ) * box;
        score++;
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    snake.unshift(newHead);
}

let lastRenderTimestamp = 0;
let lastUpdateTimestamp = 0;
const targetFPS = 60;
const gameSpeed = 100;

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    if (timestamp - lastUpdateTimestamp >= gameSpeed) {
        update();  // Move the snake and handle game logic
        lastUpdateTimestamp = timestamp;
    }

    //Clear and redraw the canvas every frame for smooth animation
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGame();
}

function drawGame() {
    createBackground();
    createSnake();
    drawFood();

    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText("Score: " + score, box, box);
}

requestAnimationFrame(gameLoop)
init();