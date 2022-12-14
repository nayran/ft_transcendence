export const INITIAL_VELOCITY = 3;
export const MAX_SCORE = 3;
export const VELOCITY_INCREASE = 0.7;


let table = {
    width: 1280,
    height: 720
};

export let player1 = {
    socket: '',
    x: 0,
    y: 0,
    score: 0,
    message: '',
    width: 15,
    height: 150,
    username: '',
};

export let player2 = {
    socket: '',
    x: 0,
    y: 0,
    score: 0,
    message: '',
    width: 15,
    height: 150,
    username: '',
};

export let ball = {
    x: 0,
    y: 0,
    radius: 5,
    velocity: 0,
    direction: {
        x: 0.0,
        y: 0.0
    },
    lastTouch: 0
}
export let powerUp = {
    x: 0,
    y: 0,
    show: false,
    type: 0,
    active: false,
}

export let started = false;
let mode = '';
let finished: boolean = false;
export let isCustom: boolean;
export let _socket: any;

export function setGameSocket(socket: any) {
    _socket = socket;
}

export function gameStart() {
    if (!started) {
        resetPlayersPosition();
        resetBall();
        resetScore();
        started = true;
    	listeners();
    }
}

export function listeners() {
    _socket.on('ball', (newBall: any) => {
        ball = newBall;
    })
    _socket.on("updateScore", (scoreP1: any, scoreP2: any, finish: any) => {
        player1.score = scoreP1;
        player2.score = scoreP2;
        finished = finish;
    })
    _socket.on('updatePowerUp', (newPowerUp: any) => {
        powerUp = newPowerUp;
    })
    paddleUpdate();
}

export function update() {
    ballUpdate();
    if (isCustom)
        powerUpUpdate()
    if (isLose()) {
        handleLose();
	syncBall();
        ball.lastTouch = 0;
    }
}

function paddleUpdate() {
    _socket.on('updatePaddle', (Player1: any, Player2: any) => {
        player1 = Player1;
        player2 = Player2;
    })
}

window.onkeydown = function move(e) {
    if (player1 && player2 && mode != 'spec' && started) {
        if (e.key == 'w' || e.key == 'W' || e.key == 'ArrowUp') {
            _socket.emit("move", "up", ball);
        }
        if (e.key == 's' || e.key == 'S' || e.key == 'ArrowDown') {
            _socket.emit("move", "down", ball);
        }
    }
}

function ballUpdate() {
    ball.x += ball.direction.x * ball.velocity;
    ball.y += ball.direction.y * ball.velocity;

    const rect = ballRect()

    if (rect.bottom >= table.height || rect.top <= 0) {
        ball.direction.y *= -1;
    }

    if (isCollision(rectP1(), rect)) {
        ball.lastTouch = 1;
        ball.direction.x *= -1;
        ball.velocity += VELOCITY_INCREASE;
	}

    if (isCollision(rectP2(), rect)) {
        ball.lastTouch = 2;
        ball.direction.x *= -1;
        ball.velocity += VELOCITY_INCREASE;
    }
}

function rectP1() {
    let rect = {
        bottom: player1.y + player1.height,
        top: player1.y,
        right: player1.x + player1.width,
        left: player1.x,
    }
    return rect;
}

function rectP2() {
    let rect = {
        bottom: player2.y + player2.height,
        top: player2.y,
        right: player2.x + player2.width,
        left: player2.x,
    }
    return rect;
}

function ballRect() {
    let rect = {
        bottom: ball.y + ball.radius,
        top: ball.y - ball.radius,
        right: ball.x + ball.radius,
        left: ball.x - ball.radius,
    }
    return rect;
}

function powerUpRect() {
    let rect = {
        bottom: powerUp.y + 100,
        top: powerUp.y,
        right: powerUp.x + 100,
        left: powerUp.x,
    }
    return rect;
}

function isCollision(rect1: { bottom: any; top: any; right: any; left: any; }, rect2: { bottom: any; top: any; right: any; left: any; }) {
    return rect1.left <= rect2.right && rect1.right >= rect2.left && rect1.top <= rect2.bottom && rect1.bottom >= rect2.top;
}

let lastPoint = 0;

function isLose() {
    let newPoint = (new Date()).getTime();
    const rect = ballRect();
    if (newPoint - lastPoint < 1000)
        return false;
    else
        lastPoint = newPoint;
    return rect.right >= table.width || rect.left <= 0;
}

function handleLose() {
    let ballSide: any;
    const rect = ballRect();
    if (rect.left <= 0) {
        player2.score += 1;
        ballSide = 1;
    }
    if (rect.right >= table.width) {
        player1.score += 1;
        ballSide = -1;
    }
    isGameFinished();
    resetPowers();
    resetPlayersPosition()
    resetBall();
    ball.direction.x *= ballSide;
    if (isPlayer())
    {
        _socket.emit('score', player1.score, player2.score, finished);
    }
}

function isGameFinished() {
    if (player1.score == MAX_SCORE) {
        finished = true;
        player1.message = 'Winner';
        player2.message = 'Loser';
    }
    else if (player2.score == MAX_SCORE) {
        finished = true;
        player1.message = 'Loser';
        player2.message = 'Winner';
    }
}

function resetBall() {
    ball.x = table.width / 2 + 5;
    ball.y = table.height / 2;
    ball.velocity = INITIAL_VELOCITY;
    ballRandomX();
    ballRandomY();
    syncBall();
}

function resetScore() {
    player1.score = 0;
    player2.score = 0;
    finished = false;
    if (isPlayer())
        _socket.emit('score', player1.score, player2.score, finished);
}

function syncBall() {
    if (_socket.id == player1.socket)
        _socket.emit('syncBall', ball);
}

function ballRandomX() {
    if (_socket.id == player1.socket) {
        ball.direction.x = Math.cos(randomNumberBetween(0.2, 0.9));
    }
    syncBall();
}

function ballRandomY() {
    if (_socket.id == player1.socket)
        ball.direction.y = Math.sin(randomNumberBetween(0.2, 2 * Math.PI - 0.2));
    syncBall();
}

function randomNumberBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function resetPlayersPosition() {
    player1.x = 20;
    player1.y = (table.height / 2) - (player1.height / 2);
    player2.x = table.width - player2.width - 20; 
    player2.y = (table.height / 2) - (player2.height / 2);
    if (isPlayer())
        _socket.emit('resetPaddles');
}

function resetPlayerPosition(player: number) {
    if (player == 1)
        player1.y = (table.height / 2) - (player1.height / 2);
    else
        player2.y = (table.height / 2) - (player2.height / 2);
}

function powerUpUpdate() {
    if (!powerUp.show && ball.lastTouch != 0 && !powerUp.active) {
        resetPowerUp(true);
    	syncPowerUp();
    }
    if (powerUp.show && isCollision(ballRect(), powerUpRect())) {
        resetPowerUp(false);
        powerUp.active = true;
        if (_socket.id == player1.socket)
            givePowerUp();
    	syncPowerUp();
    }
}

function resetPowerUp(show: boolean) {
    if (_socket.id == player1.socket) {
        powerUp.x = randomNumberBetween(30, table.width - 130); // powerup size = 100
        powerUp.y = randomNumberBetween(0, table.height - 100);
    }
    powerUp.active = false;
    powerUp.show = show;
}

function syncPowerUp() {
    if (isPlayer())
        _socket.emit('powerUp', powerUp);
}

function resetPowers() {
    ball.radius = 5;
    resetPowerUp(false);
    syncPowerUp();
}

function givePowerUp() {
    let power = Math.round(randomNumberBetween(1, 3))
    let player;
    if (ball.lastTouch == 1)
        player = player1
    else
        player = player2
    if (power == 1) {
        powerUp.type = power;
        ball.radius = 20;
        syncBall();
    }
    else if (power == 2) {
        powerUp.type = power;
        player.height = 500;
        resetPlayerPosition(ball.lastTouch);
        if (isPlayer())
            _socket.emit('setPaddles', player1.height, player1.y, player2.height, player2.y);
    }
    else if (power == 3) {
        powerUp.type = power;
        player.height = 50;
        if (isPlayer())
            _socket.emit('setPaddles', player1.height, player1.y, player2.height, player2.y);
    }
}

export function setP1Socket(socket: any) {
    player1.socket = socket;
}
export function setP2Socket(socket: any) {
    player2.socket = socket;
}

export function setMode(mod: any) {
    mode = mod;
}

export function setCustom(custom: boolean) {
    isCustom = custom;
}

export function setP1Username(username: string) {
    player1.username = username;
}

export function setP2Username(username: string) {
    player2.username = username;
}

export function setFinished() {
    finished = true;
}

function isPlayer() {
    if (_socket.id == player1.socket || _socket.id == player2.socket)
        return true;
    return false;
}

export function setStarted(b: boolean) {
    started = b;
}
