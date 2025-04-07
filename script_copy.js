// Get the canvas and set up the context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Constants
const BOARD_SIZE = 8;
const TILE_SIZE = 60;
const SHIFT = 20;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Piece and tile identifiers
const EMPTY = 0;
const BLACK_TILE = 1;
const BLACK_PIECE = 2;
const BLACK_KING = 3;
const WHITE_PIECE = 4;
const WHITE_KING = 5;

// Load images
const images = {
    whiteTile: new Image(),
    blackTile: new Image(),
    redPiece: new Image(),
    blackPiece: new Image(),
    flagImage: new Image()
};

// Assign sources
images.whiteTile.src = "./img/white_block.png";  // Light tile
images.blackTile.src = "./img/black_block.png";  // Dark tile
images.redPiece.src = "./img/white.png";         // Assuming this represents red pieces
images.blackPiece.src = "./img/black.png";       // Black pieces
images.flagImage.src = "./img/flag.png";         // Assign an actual file path

// Game board state (8x8 matrix)
const boardState = [
    [EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE],
    [BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY],
    [EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE],
    [BLACK_TILE, EMPTY, BLACK_TILE, EMPTY, BLACK_PIECE, EMPTY, BLACK_TILE, EMPTY],
    [EMPTY, BLACK_TILE, EMPTY, BLACK_TILE, EMPTY, BLACK_TILE, EMPTY, BLACK_TILE],
    [WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY],
    [EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE],
    [WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY]
];

class Button {
    constructor(x, y, width, height, text, fontSize = 40, color = "#4CAF50", textColor = "white") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.fontSize = fontSize;
        this.color = color;
        this.textColor = textColor;
    }

    draw(ctx) {
        // Draw the button (capsule)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.height / 2); // Capsule shape
        ctx.fill();

        // Draw the text on the button
        ctx.fillStyle = this.textColor;
        ctx.font = `${this.fontSize}px Comic Sans MS`;
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 1.5); // Center text
    }

    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height;
    }
}

class Footer {
    constructor(canvas, isMenu = false) {
        this.canvas = canvas;
        this.isMenu = isMenu;
        this.buttons = isMenu ? [
            new Button(canvas.width * 0.5 - 125, 200, 250, 70, "Play"),
            new Button(canvas.width * 0.5 - 125, 300, 250, 70, "New Game"),
            new Button(canvas.width * 0.5 - 125, 400, 190, 70, "New Score"),
            new Button(canvas.width * 0.1, 60, 70, 70, "Settings")
        ] : [
            new Button(canvas.width * 0.1 - 60, canvas.height - 90, 250, 70, "Menu"),
            new Button(canvas.width * 0.37 - 60, canvas.height - 90, 250, 70, "New game"),
            new Button(canvas.width * 0.7 - 85, canvas.height - 90, 190, 70, "0.00"),
            new Button(canvas.width * 0.9 - 60, canvas.height - 90, 90, 70, "?")
        ];
        this.buttons[2].textColor = "Yellow";
    }

    draw(ctx) {
        this.buttons.forEach(button => button.draw(ctx));
    }

    handleClick(event, switchScene) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - canvasRect.left;
        let mouseY = event.clientY - canvasRect.top;
        mouseY -= 70; // Adjust for footer position

        this.buttons.forEach((button, index) => {
            if (button.isClicked(mouseX, mouseY)) {
                console.log("Button clicked:", button.text);
                if (button.text === "Menu") {
                    switchScene("menu");
                } else if (button.text === "Play") {
                    switchScene("game");
                } else if (button.text === "Exit") {
                    console.log("Exit the game");
                    // Add logic to exit or quit game if needed
                }
            }
        });
    }
}

// Function to draw the board using images
function drawBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const x = col * TILE_SIZE + SHIFT;
            const y = row * TILE_SIZE + SHIFT;
            const tileImage = (row + col) % 2 === 0 ? images.whiteTile : images.blackTile;

            if (tileImage.complete) {
                ctx.drawImage(tileImage, x, y, TILE_SIZE, TILE_SIZE);
            } else {
                tileImage.onload = () => ctx.drawImage(tileImage, x, y, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// Function to draw pieces based on boardState
function drawPieces() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const x = col * TILE_SIZE + SHIFT;
            const y = row * TILE_SIZE + SHIFT;
            const piece = boardState[row][col];

            let pieceImage = null;
            if (piece === BLACK_PIECE || piece === BLACK_KING) {
                pieceImage = images.blackPiece;
            } else if (piece === WHITE_PIECE || piece === WHITE_KING) {
                pieceImage = images.redPiece;
            }

            if (pieceImage) {
                if (pieceImage.complete) {
                    ctx.drawImage(pieceImage, x, y, TILE_SIZE, TILE_SIZE);
                } else {
                    pieceImage.onload = () => ctx.drawImage(pieceImage, x, y, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}

// Function to draw text on the canvas
function drawText() {
    ctx.font = "30px Comic Sans MS";  // Set font style
    ctx.fillStyle = "black";          // Text color
    ctx.textAlign = "center";         // Center alignment
    ctx.fillText("Checkers Bot", canvas.width*0.65, 100);

    ctx.font = "60px Comic Sans MS";  // Set font style
    ctx.fillStyle = "black";          // Text color
    ctx.textAlign = "center";         // Center alignment
    ctx.fillText("Your Turn", canvas.width*0.72, 220);
}

function drawFlag() {
    ctx.drawImage(images.flagImage, canvas.width-150, 10, TILE_SIZE*2, TILE_SIZE*2);
}

// Function to draw a capsule-shaped progress bar
function drawProgressBar() {
    const x = canvas.width * 0.75; // Position
    const y = 250;
    const width = 350;
    const height = 80;
    const borderRadius = height / 2; // Capsule effect
    let progress = 0.69; // Example progress (75%)

    // Draw outer capsule (background)
    ctx.fillStyle = "#ccc"; // Light gray background
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y, width, height, borderRadius);
    ctx.fill();

    // Draw inner capsule (progress)
    ctx.fillStyle = "#4caf50"; // Green progress bar
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y, width * progress, height, borderRadius);
    ctx.fill();

    // Draw text in the middle
    ctx.fillStyle = "black";
    ctx.font = "30px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(progress * 100) + "%", x, y + height / 1.5);
}

// Function to render the game state
function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
    drawBoard();
    drawPieces();
    drawText(); // Draw the text after board and pieces
    drawFlag();
    drawProgressBar(); // Call progress bar function
    footer.draw(ctx);
}

// Function to render the menu state
function renderMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Background for menu

    ctx.font = "50px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Checkers Bot", canvas.width / 2, 100);

    footer.draw(ctx);
}

// Function to switch scenes
let currentScene = "game";
function switchScene(scene) {
    currentScene = scene;
    footer = new Footer(canvas, scene === "menu");
    if (scene === "game") {
        renderGame();
    } else if (scene === "menu") {
        renderMenu();
    }
}

// Initialize the footer
let footer = new Footer(canvas, false);

// Initialize the game after all images are loaded
const imageLoadPromises = Object.values(images).map(image => 
    new Promise(resolve => image.onload = resolve)
);

Promise.all(imageLoadPromises).then(renderGame);

// Add event listener for clicks on the canvas
canvas.addEventListener("click", function(event) {
    footer.handleClick(event, switchScene); // Delegate click handling to the Footer class
});
