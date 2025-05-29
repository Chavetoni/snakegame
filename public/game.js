let canvas = document.getElementById('game');
let context = canvas.getContext('2d');
let video = document.getElementById('videoElement');
let score = 0;
let useCamera = false;
let loadedImages = {};


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
let snake = [{x:1 * box, y:8 *box}];
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
    if (useCamera && webcam) { 
        webcam.update(); 
        await predict();
    }
    window.requestAnimationFrame(loop); 
}

document.getElementById('toggle').addEventListener('change', async (event) => {
    useCamera = event.target.checked;
    if (useCamera) {
        if (!webcam) { // Initialize webcam if not already done
            webcam = new tmImage.Webcam(200, 200);
            await webcam.setup(); // Only setup once
            await webcam.play();
            // Optionally make videoElement visible here if you want to show the feed
            // video.style.display = 'block'; 
        } else {
            await webcam.play(); // Resume if paused
            // video.style.display = 'block';
        }
        // Start the loop if it's the first time or if it was stopped
        if (!window.webcamLoopStarted) { 
            window.requestAnimationFrame(loop);
            window.webcamLoopStarted = true;
        }
    } else {
        if (webcam) {
            webcam.pause(); // Pause the webcam to save resources
            // Optionally hide the videoElement
            // video.style.display = 'none';
        }
    }
});


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
    let snakeX = snake[0].x;
    let snakeY = snake[0].y

    // Check if the snake hits the boundaries
    if (snakeX < 0 || snakeX >= 16 * box || snakeY < 0 || snakeY >= 16 * box) {
        showPrompt();
        return;
    }

    for (i = 1; i < snake.length; i++) {
        if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
            showPrompt();
            return;
        }
    }

    

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

function resetGame() {
    snake = [{x: 1 * box, y: 8 * box}];
    direction = "right";
    score = 0;
    food = {
        x: Math.floor(Math.random() * 15 + 1) * box,
        y: Math.floor(Math.random() * 15 + 1) * box
    };
    lastUpdateTimestamp = 0; 
    requestAnimationFrame(gameLoop);
}


function showPrompt() {
    const retryPrompt = document.createElement('div');
    retryPrompt.style.position = 'absolute';
    retryPrompt.style.top = '50%';
    retryPrompt.style.left = '50%';
    retryPrompt.style.transform = 'translate(-50%, -50%)';
    retryPrompt.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    retryPrompt.style.color = 'white';
    retryPrompt.style.padding = '20px';
    retryPrompt.style.textAlign = 'center';
    retryPrompt.style.textAlign = 'gameOverPrompt';
    retryPrompt.innerHTML = `
        <h2>Game Over!</h2>
        <p> Your score was: ${score}</p>
        <button id="retryButton">Retry</button>
    `;
    document.body.appendChild(retryPrompt);

    function removePrompt() {
        retryPrompt.remove();
        document.removeEventListener('click', handleClickOutside);
    }

    function handleClickOutside(event) {
        if (!retryPrompt.contains(event.target)) {
            removePrompt();
            resetGame();
        }
    }

    retryPrompt.addEventListener('click', (event) => {
        if (event.target.id === 'retryButton') {
            removePrompt()
            resetGame();
        }
    });

    document.addEventListener('click', handleClickOutside);
}

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

