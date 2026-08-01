let canvas = document.querySelector("#canvas"); 
let ctx = canvas.getContext("2d"); 
let width = canvas.width; 
let height = canvas.height; 

// 1. Move score variables UP here so initBall() can safely read them on start
let leftScore = 0; 
let rightScore = 0; 
let gameOver = false; 

// Limit the computer speed 
const MAX_COMPUTER_SPEED = 2; 

const BALL_SIZE = 5; 
let ballPosition; 
let xSpeed; 
let ySpeed; 

function initBall() { 
  ballPosition = {x: 20, y: 30}; 
  // Calculate total points scored in the game 
  let totalScore = leftScore + rightScore; 
  xSpeed = 4 + (totalScore * 0.5); 
  ySpeed = 2 + (totalScore * 0.25); 
  
  // Keep the ball moving in the correct direction after reset 
  if (leftScore > rightScore) { 
    xSpeed = -xSpeed; 
  } 
} 

const PADDLE_WIDTH = 5; 
const PADDLE_HEIGHT = 20; 
const PADDLE_OFFSET = 10; 
let leftPaddleTop = 10; 
let rightPaddleTop = 30; 

let targetMouseY = 30; 
document.addEventListener("mousemove", e => { 
  targetMouseY = e.y - canvas.offsetTop; 
}); 

const MAX_PLAYER_SPEED = 3; 

function movePlayerPaddle() { 
  let targetTop = targetMouseY - (PADDLE_HEIGHT / 2); 
  let diff = targetTop - rightPaddleTop; 
  if (Math.abs(diff) > MAX_PLAYER_SPEED) { 
    if (diff > 0) { 
      rightPaddleTop += MAX_PLAYER_SPEED; 
    } else { 
      rightPaddleTop -= MAX_PLAYER_SPEED; 
    } 
  } else { 
    rightPaddleTop = targetTop; 
  } 
} 

// 2. RESTORED THE MISSING DRAW FUNCTION WRAPPER HERE
function draw() {
  // Fill the canvas with black 
  ctx.fillStyle = "black"; 
  ctx.fillRect(0, 0, width, height); 

  // Everything else will be white 
  ctx.fillStyle = "white"; 

  // Draw the ball 
  ctx.fillRect(ballPosition.x, ballPosition.y, BALL_SIZE, BALL_SIZE); 

  // Draw the paddles 
  ctx.fillRect( PADDLE_OFFSET, leftPaddleTop, PADDLE_WIDTH, PADDLE_HEIGHT ); 
  ctx.fillRect( width - PADDLE_WIDTH - PADDLE_OFFSET, rightPaddleTop, PADDLE_WIDTH, PADDLE_HEIGHT ); 

  // Draw scores 
  ctx.font = "30px monospace"; 
  ctx.textAlign = "left"; 
  ctx.fillText(leftScore.toString(), 50, 50); 
  ctx.textAlign = "right"; 
  ctx.fillText(rightScore.toString(), width - 50, 50); 
}

function followBall() { 
  let ball = { top: ballPosition.y, bottom: ballPosition.y + BALL_SIZE }; 
  let leftPaddle = { top: leftPaddleTop, bottom: leftPaddleTop + PADDLE_HEIGHT }; 
  if (ball.top < leftPaddle.top) { 
    leftPaddleTop -= MAX_COMPUTER_SPEED; 
  } else if (ball.bottom > leftPaddle.bottom) { 
    leftPaddleTop += MAX_COMPUTER_SPEED; 
  } 
} 

function update() { 
  ballPosition.x += xSpeed; 
  ballPosition.y += ySpeed; 
  followBall(); 
  movePlayerPaddle(); // Moves the player paddle smoothly 
} 

function checkPaddleCollision(ball, paddle) { 
  // Check if the paddle and ball overlap vertically and horizontally 
  return ( 
    ball.left < paddle.right && 
    ball.right > paddle.left && 
    ball.top < paddle.bottom && 
    ball.bottom > paddle.top 
  ); 
} 

function adjustAngle(distanceFromTop, distanceFromBottom) { 
  if (distanceFromTop < 5) { 
    ySpeed -= 0.5; 
  } else if (distanceFromBottom < 0) { 
    ySpeed += 0.5; 
  } 
} 

// Draw Game over after 9 points 
function drawGameOver() { 
  ctx.fillStyle = "white"; 
  ctx.font = "30px monospace"; 
  ctx.textAlign = "center"; 
  ctx.fillText("Game Over", width / 2, height / 2); 
} 

function checkCollision() { 
  let ball = { left: ballPosition.x, right: ballPosition.x + BALL_SIZE, top: ballPosition.y, bottom: ballPosition.y + BALL_SIZE } 
  if (ball.left < 0 || ball.right > width) { 
    xSpeed = -xSpeed; 
  } 
  if (ball.top < 0 || ball.bottom > height) { 
    ySpeed = -ySpeed; 
  } 
  let leftPaddle = { left: PADDLE_OFFSET, right: PADDLE_OFFSET + PADDLE_WIDTH, top: leftPaddleTop, bottom: leftPaddleTop + PADDLE_HEIGHT } 
  let rightPaddle = { left: width - PADDLE_WIDTH - PADDLE_OFFSET, right: width - PADDLE_OFFSET, top: rightPaddleTop, bottom: rightPaddleTop + PADDLE_HEIGHT }; 
  
  if (checkPaddleCollision(ball, leftPaddle)) { 
    let distanceFromTop = ball.top - leftPaddle.top; 
    let distanceFromBottom = leftPaddle.bottom - ball.bottom; 
    adjustAngle(distanceFromTop, distanceFromBottom); 
    xSpeed = Math.abs(xSpeed); 
  } 
  if (checkPaddleCollision(ball, rightPaddle)) { 
    let distanceFromTop = ball.top - rightPaddle.top; 
    let distanceFromBottom = rightPaddle.bottom - ball.bottom; 
    adjustAngle(distanceFromTop, distanceFromBottom); 
    xSpeed = -Math.abs(xSpeed); 
  } 
  if (ball.left < 0) { 
    rightScore++; 
    initBall(); 
  } 
  if (ball.right > width) { 
    leftScore++; 
    initBall(); 
  }
  
  // Cleaned up the game over state placement so it monitors both players
  if (leftScore > 9 || rightScore > 9) { 
    gameOver = true; 
  } 
  // (DUPLICATE UPDATE FUNCTION WAS REMOVED FROM HERE)
} 

function gameLoop() { 
  draw(); 
  if (gameOver) { 
    drawGameOver(); 
  } else { 
    update(); 
    checkCollision(); 
    setTimeout(gameLoop, 30); 
  } 
} 

initBall(); 
gameLoop();
