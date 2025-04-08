//STRATEGY design pattern
//js game framework
// phaser js

// **Constants**
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;
const BOARD_SIZE = 8;
const TILE_SIZE = 580 / BOARD_SIZE; // Approx 72.5 pixels
const BOARD_X = 20;
const BOARD_Y = 20;

// **Canvas Setup**
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// **Image Resources**
const images = {
    whiteTile: new Image(),
    blackTile: new Image(),
    redPiece: new Image(),
    blackPiece: new Image(),
    flagImage: new Image(),
    logo: new Image(),
    settings: new Image(),
    profile: new Image(),
    qa: new Image(),
    new_game_button: new Image(),
    naming: new Image(),
    board: new Image(),
    difficulty: new Image(),
    your_turn: new Image(),
    dificulty_avatar: new Image(),
    menu_button: new Image(),
    whitePiece: new Image(),
    play_btn: new Image(),
    new_game_btn: new Image(),
    your_score_btn: new Image()
};

// Assign image sources
images.whiteTile.src = "./img/white_block.png";
images.blackTile.src = "./img/black_block.png";
images.redPiece.src = "./img/white.png";
images.blackPiece.src = "./img/blackPiece.png";
images.flagImage.src = "./img/flag.png";
images.logo.src = "./img/logo.png";
images.settings.src = "./img/settings_btn.png";
images.profile.src = "./img/profile_btn.png";
images.qa.src = "./img/QA_button.png";
images.new_game_button.src = "./img/new_game_button.png";
images.naming.src = "./img/Naming.png";
images.board.src = "./img/boarf.png";
images.difficulty.src = "./img/buttondifficulty.png";
images.your_turn.src = "./img/Your turn.png";
images.dificulty_avatar.src = "./img/deda.png";
images.menu_button.src = "./img/menu_button.png";
images.whitePiece.src = "./img/whitePiece.png";
images.play_btn.src = "./img/play_btn.png";
images.new_game_btn.src = "./img/new_game_btn.png";
images.your_score_btn.src = "./img/your_score_btn.png";

// **Button Class**
class Button {
    constructor(x, y, width, height, text, scene, onClick = null, img = null, fontSize = 40, color = "#4CAF50", textColor = "white") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.scene = scene;
        this.onClick = onClick;
        this.img = img;
        this.fontSize = fontSize;
        this.color = color;
        this.textColor = textColor;
    }

    draw() {
        if (currentScene !== this.scene) return;
        ctx.save();
        if (this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, this.height / 2);
            ctx.fill();

            ctx.textAlign = "center";
            ctx.font = `bold ${this.fontSize}px Impact, Arial Black, Comic Sans MS`;
            ctx.fillStyle = this.textColor;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 6;
            ctx.translate(this.x + this.width / 2, this.y + this.height / 1.5);
            ctx.scale(1.15, 1);
            ctx.strokeText(this.text, 0, 0);
            ctx.fillText(this.text, 0, 0);
        }
        ctx.restore();
    }

    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
        mouseY >= this.y && mouseY <= this.y + this.height;
    }
}

    // **Piece Class**
class Piece {
    constructor(tileX, tileY, type, image) {
        this.tileX = tileX;         // Current position in tile coordinates (0-7)
        this.tileY = tileY;
        this.type = type;           // "black" or "white"
        this.image = image;
        this.isKing = false;
        this.selected = false;
        this.isMoving = false;
        this.moveProgress = 0;      // Animation progress (0 to 1)
        this.startTileX = 0;
        this.startTileY = 0;
        this.targetTileX = 0;
        this.targetTileY = 0;
    }

    draw() {
        if (currentScene !== "game") return;
            let pixelX, pixelY;
        if (this.isMoving) {
            const startX = BOARD_X + this.startTileX * TILE_SIZE;
            const startY = BOARD_Y + this.startTileY * TILE_SIZE;
            const endX = BOARD_X + this.targetTileX * TILE_SIZE;
            const endY = BOARD_Y + this.targetTileY * TILE_SIZE;
            pixelX = startX + (endX - startX) * this.moveProgress;
            pixelY = startY + (endY - startY) * this.moveProgress;
        } else {
            pixelX = BOARD_X + this.tileX * TILE_SIZE;
            pixelY = BOARD_Y + this.tileY * TILE_SIZE;
        }

        const padding = 5;
        const drawWidth = TILE_SIZE - padding * 2;
        const drawHeight = TILE_SIZE - padding * 2;
        ctx.drawImage(this.image, pixelX + padding, pixelY + padding, drawWidth, drawHeight);

        if (this.selected) {
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 4;
            ctx.strokeRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        }
    }

    startMove(targetTileX, targetTileY) {
        this.startTileX = this.tileX;
        this.startTileY = this.tileY;
        this.targetTileX = targetTileX;
        this.targetTileY = targetTileY;
        this.isMoving = true;
        this.moveProgress = 0;
    }

    update(deltaTime) {
        if (!this.isMoving) return;
        this.moveProgress += deltaTime / 500; // Movement takes 500ms
        if (this.moveProgress >= 1) {
            this.moveProgress = 1;
            this.isMoving = false;
            this.tileX = this.targetTileX;
            this.tileY = this.targetTileY;
            // TODO: Add kinging logic here later
        }
    }

    isClicked(mouseX, mouseY) {
        const pixelX = BOARD_X + this.tileX * TILE_SIZE;
        const pixelY = BOARD_Y + this.tileY * TILE_SIZE;
        return mouseX >= pixelX && mouseX < pixelX + TILE_SIZE &&
        mouseY >= pixelY && mouseY < pixelY + TILE_SIZE;
    }

    select() {
        pieces.forEach(p => p.selected = false);
        this.selected = true;
    }
}

    // **Game State**
let currentScene = "menu";
let pieces = [];
const buttons = [
    // Menu Buttons
    new Button(canvas.width * 0.5 - 125, 20, 250, 250, "Flag", "menu", () => switchScene("game"), images.logo),
    new Button(20, 20, 90, 90, "Settings", "menu", () => switchScene("settings"), images.settings),
    new Button(canvas.width - 110, 20, 90, 90, "Profile", "menu", () => switchScene("profile"), images.profile),
    new Button(canvas.width - 110, canvas.height - 110, 90, 90, "QA", "menu", () => switchScene("qa"), images.qa),
    new Button(canvas.width / 2 - 150, canvas.height / 2, 300, 70, "Play", "menu", () => switchScene("game"), images.play_btn, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 92, 300, 70, "New Game", "menu", () => { switchScene("game"); resetBoard(); }, images.new_game_btn, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 184, 300, 70, "Your Score", "menu", () => switchScene("game"), images.your_score_btn, 40, "#A6BFDB", "#6A8CBB"),

    // Game Buttons
    new Button(canvas.width - 170, 20, 150, 150, "Flag", "game", () => switchScene("menu"), images.logo),
    new Button(canvas.width / 2 + 150, 270, 350, 100, "Difficulty", "game", null, images.difficulty),
    new Button(10, canvas.height - 100, 300, 70, "Menu", "game", () => switchScene("menu"), images.menu_button, 40, "#A6BFDB", "#6A8CBB"),
    new Button(340, canvas.height - 100, 300, 70, "New Game", "game", () => { switchScene("game"); resetBoard(); }, images.new_game_button, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width - 110, canvas.height - 110, 90, 90, "QA", "game", () => switchScene("qa"), images.qa)
];

// **Initialization Functions**
function resetBoard() {
    pieces = [
        // Black pieces (top)
        new Piece(1, 0, "black", images.blackPiece),
        new Piece(3, 0, "black", images.blackPiece),
        new Piece(5, 0, "black", images.blackPiece),
        new Piece(7, 0, "black", images.blackPiece),
        new Piece(0, 1, "black", images.blackPiece),
        new Piece(2, 1, "black", images.blackPiece),
        new Piece(4, 1, "black", images.blackPiece),
        new Piece(6, 1, "black", images.blackPiece),
        new Piece(1, 2, "black", images.blackPiece),
        new Piece(3, 2, "black", images.blackPiece),
        new Piece(5, 2, "black", images.blackPiece),
        new Piece(7, 2, "black", images.blackPiece),
        // White pieces (bottom)
        new Piece(0, 7, "white", images.whitePiece),
        new Piece(2, 7, "white", images.whitePiece),
        new Piece(4, 7, "white", images.whitePiece),
        new Piece(6, 7, "white", images.whitePiece),
        new Piece(1, 6, "white", images.whitePiece),
        new Piece(3, 6, "white", images.whitePiece),
        new Piece(5, 6, "white", images.whitePiece),
        new Piece(7, 6, "white", images.whitePiece),
        new Piece(0, 5, "white", images.whitePiece),
        new Piece(2, 5, "white", images.whitePiece),
        new Piece(4, 5, "white", images.whitePiece),
        new Piece(6, 5, "white", images.whitePiece)
    ];
}

    // **Scene Management**
function switchScene(scene) {
    currentScene = scene;
}

    // **Rendering Functions**
function drawBoard() {
    ctx.drawImage(images.board, BOARD_X, BOARD_Y, 580, 580);
}

function drawPieces() {
    pieces.forEach(piece => piece.draw());
}

function drawProgressBar() {
    const x = canvas.width / 2 + 320;
    const y = 460;
    const width = 350;
    const height = 80;
    const borderRadius = height / 2;
    const progress = 0.49; // Static 69% for now

    ctx.save();
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y, width, height, borderRadius);
    ctx.fill();
    ctx.restore();

    const padding = 6;
    const innerWidth = (width - padding * 2) * progress;
    const innerHeight = height - padding * 2;
    ctx.fillStyle = "#C8D093";
    ctx.beginPath();
    ctx.roundRect(x - width / 2 + padding, y + padding, innerWidth, innerHeight, innerHeight / 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.font = "30px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(progress * 100) + "%", x, y + height / 2);
}

function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    buttons.forEach(button => button.draw());

    if (currentScene === "menu") {
        ctx.drawImage(images.naming, canvas.width / 2 - 350, 270, 700, 100);
    } else if (currentScene === "game") {
        drawBoard();
        drawPieces();
        ctx.drawImage(images.naming, canvas.width / 2 + 100, 70, 220, 40);
        ctx.drawImage(images.your_turn, canvas.width / 2 + 220, 400, 200, 50);
        drawProgressBar();
        ctx.drawImage(images.dificulty_avatar, canvas.width / 2 + 150, 220, 90, 150);
    }
}

    // **Game Loop**
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (currentScene === "game") {
        pieces.forEach(piece => piece.update(deltaTime));
    }

    renderScene();
    requestAnimationFrame(gameLoop);
}

// **Event Handlers**
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Handle button clicks
    buttons.forEach(button => {
        if (button.scene === currentScene && button.isClicked(mouseX, mouseY) && button.onClick) {
            button.onClick();
        }
    });

    if (currentScene === "game") {
        let pieceClicked = false;
        // Handle piece selection
        pieces.forEach(piece => {
            if (piece.isClicked(mouseX, mouseY)) {
                piece.select();
                pieceClicked = true;
            }
        });

        // Handle piece movement
        if (!pieceClicked) {
            const selectedPiece = pieces.find(p => p.selected);
            if (selectedPiece) {
                const tileX = Math.floor((mouseX - BOARD_X) / TILE_SIZE);
                const tileY = Math.floor((mouseY - BOARD_Y) / TILE_SIZE);
                if (isValidMove(selectedPiece, tileX, tileY)) {
                    selectedPiece.startMove(tileX, tileY);
                    selectedPiece.selected = false;
                }
            }
        }
    }
});

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let hovering = false;
    buttons.forEach(button => {
        if (button.scene === currentScene && button.isClicked(mouseX, mouseY)) {
            hovering = true;
        }
    });
    if (currentScene === "game") {
        pieces.forEach(piece => {
            if (piece.isClicked(mouseX, mouseY)) {
                hovering = true;
            }
        });
    }
    canvas.style.cursor = hovering ? "pointer" : "default";
});

// **Helper Functions**
function isValidMove(piece, targetX, targetY) {
    // Basic placeholder: diagonal move to an empty tile
    if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) return false;
    if (pieces.some(p => p.tileX === targetX && p.tileY === targetY)) return false;
    const dx = Math.abs(targetX - piece.tileX);
    const dy = targetY - piece.tileY;
    if (dx !== 1 || Math.abs(dy) !== 1) return false;
    if (piece.type === "black" && dy <= 0) return false; // Black moves down
    if (piece.type === "white" && dy >= 0) return false; // White moves up
    return true;
}

// **Initialization**
const imageLoadPromises = Object.values(images).map(img =>
    new Promise(resolve => img.onload = resolve)
);

Promise.all(imageLoadPromises).then(() => {
    resetBoard();
    switchScene("menu");
    requestAnimationFrame(gameLoop);
});