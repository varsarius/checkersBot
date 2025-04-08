//STRATEGY design pattern
//js game framework
// phaser js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let images = {
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
    blackPiece: new Image(),
    play_btn: new Image(),
    new_game_btn: new Image(),
    your_score_btn: new Image(),
};

// Assign sources
images.whiteTile.src = "./img/white_block.png";  // Light tile
images.blackTile.src = "./img/black_block.png";  // Dark tile
images.redPiece.src = "./img/white.png";         // Assuming this represents red pieces
images.blackPiece.src = "./img/black.png";       // Black pieces
images.flagImage.src = "./img/flag.png";         // Assign an actual file path
images.logo.src = "./img/logo.png";
images.settings.src = "./img/settings_btn.png";
images.profile.src = "./img/profile_btn.png";
images.qa.src = "./img/QA_button.png";
images.new_game_button.src = "./img/new_game_button.png";
images.naming.src = "./img/Naming.png";
images.board.src = "./img/boarf.png";
images.difficulty.src = "./img/buttondifficulty.png";
images.your_turn.src = "./img/Your turn.png"
images.dificulty_avatar.src = "./img/deda.png";
images.menu_button.src = "./img/menu_button.png";
images.whitePiece.src = "./img/whitePiece.png";
images.blackPiece.src = "./img/blackPiece.png";
images.play_btn.src = "./img/play_btn.png";
images.new_game_btn.src = "./img/new_game_btn.png";
images.your_score_btn.src = "./img/your_score_btn.png";


// Piece and tile identifiers
// const EMPTY = 0;
// const BLACK_TILE = 1;
// const BLACK_PIECE = 2;
// const BLACK_KING = 3;
// const WHITE_PIECE = 4;
// const WHITE_KING = 5;
//
// const boardState = [
//     [EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE],
//     [BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY],
//     [EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE, EMPTY, BLACK_PIECE],
//     [BLACK_TILE, EMPTY, BLACK_TILE, EMPTY, BLACK_PIECE, EMPTY, BLACK_TILE, EMPTY],
//     [EMPTY, BLACK_TILE, EMPTY, BLACK_TILE, EMPTY, BLACK_TILE, EMPTY, BLACK_TILE],
//     [WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY],
//     [EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE],
//     [WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY, WHITE_PIECE, EMPTY]
// ];






// Function to switch scenes
let currentScene = "menu";
function switchScene(scene) {
    currentScene = scene;
    if (scene === "game") {
        renderGame();
    } else if (scene === "menu") {
        renderMenu();
    }
}

class Button {
    constructor(x, y, width, height, text, scene, onClick = null, img = null, fontSize = 40, color = "#4CAF50", textColor = "white") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.scene = scene;
        this.fontSize = fontSize;
        this.color = color;
        this.textColor = textColor;
        this.onClick = onClick;
        this.img = img;
    }

    drow(ctx) {
        // Draw the button (capsule)
        if(currentScene === this.scene){
            ctx.save(); // Save state

            if(this.img){
                ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            } else {
                // Draw the text on the button

                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.roundRect(this.x, this.y, this.width, this.height, this.height / 2); // Capsule shape
                ctx.fill();



                ctx.textAlign = "center";
                ctx.font = `bold ${this.fontSize}px Impact, Arial Black, Comic Sans MS`; // Thicker fonts
                ctx.fillStyle = this.textColor || "#001f4d"; // Dark blue
                ctx.strokeStyle = "white";
                ctx.lineWidth = 6; // Thicker border

// Optional: Make the text appear wider
                ctx.translate(this.x + this.width / 2, this.y + this.height / 1.5);
                ctx.scale(1.15, 1); // Horizontal stretch only

// Bold stroke by drawing multiple times slightly offset
                ctx.strokeText(this.text, 0, 0);
                ctx.strokeText(this.text, 0.5, 0);
                ctx.strokeText(this.text, -0.5, 0);

// Fill text
                ctx.fillText(this.text, 0, 0);



            }
            ctx.restore(); // Restore canvas to normal
        }
    }

    isClicked(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height;
    }
}

//just a draft of this Class. Need to be comfortable in managing pieces.
class Piece {
    constructor(x, y, width, height, type, image) {
        this.x = x; //from 1 to 8
        this.y = y; //from 1 to 8
        this.width = width;
        this.height = height;
        this.type = type;
        this.image = image;
        this.selected = false;
    }
    draw(boardX, boardY){
        ctx.save();
        if(currentScene === "game"){
            let padding = 5;
            const posX = boardX + this.x * this.width + padding;
            const posY = boardY + this.y * this.height + padding;
            const drawWidth = this.width - padding * 2;
            const drawHeight = this.height - padding * 2;

// If selected, draw a border
            if (this.selected) {
                ctx.save();
                ctx.strokeStyle = 'yellow'; // or any color you want
                ctx.lineWidth = 4;          // thicker line for visibility
                ctx.strokeRect(posX - 2, posY - 2, drawWidth + 4, drawHeight + 4);
                ctx.restore();
            }
            ctx.drawImage(this.image, boardX + this.x * this.width + padding, boardY + this.y * this.height + padding, this.width - padding*2, this.height - padding*2);
        }
        ctx.restore();
    }
    move(x, y){
        this.x = x;
        this.y = y;
        renderGame();
    }
    select() {
        pieces.forEach(piece => piece.selected = false);

        this.selected = true;
        console.log("as");
        renderGame();

    }
    isClicked(mouseX, mouseY) {
        let boardX = 20
        let boardY = 20
        let padding = 5;
        return mouseX >= boardX + this.x * this.width + padding && mouseX <= boardX + this.x * this.width + padding + this.width &&
            mouseY >= boardY + this.y * this.height + padding && mouseY <= boardY + this.y * this.height + this.height + padding;
    }
}


let buttons = [
    // menu scene
    new Button(canvas.width * 0.5 - 125, 20, 250, 250, "Flag", "menu", () => switchScene("game"), images.logo),
    new Button(20, 20, 90, 90, "Settings", "menu", () => switchScene("settings"), images.settings),
    new Button(canvas.width - 20 - 90, 20, 90, 90, "Profile", "menu", () => switchScene("profile"), images.profile),
    new Button(canvas.width - 20 - 90, canvas.height - 20 - 90, 90, 90, "qa", "menu", () => switchScene("qa"), images.qa),

    new Button(canvas.width / 2 - 150, canvas.height / 2, 300, 70, "Play", "menu", () => switchScene("game"), images.play_btn, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 92, 300, 70, "New Game", "menu", () => {switchScene("game"), resetBoard()}, images.new_game_btn, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 92 + 92, 300, 70, "Your Score", "menu", () => switchScene("game"), images.your_score_btn, 40, "#A6BFDB", "#6A8CBB"),

    // game scene
    new Button(canvas.width - 170, 20, 150, 150, "Flag", "game", () => switchScene("menu"), images.logo),
    new Button(canvas.width / 2 + 150, 270, 350, 100, "Difficulty", "game", () => switchScene("game"), images.difficulty),

    new Button(10, canvas.height - 100, 300, 70, "Manu", "game", () => switchScene("menu"), images.menu_button, 40, "#A6BFDB", "#6A8CBB"),
    new Button(10 + 330, canvas.height - 100, 300, 70, "New Game", "game", () => switchScene("game"), images.new_game_button, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width - 20 - 90, canvas.height - 20 - 90, 90, 90, "qa", "game", () => switchScene("qa"), images.qa),

    //new Button(canvas.width * 0.5 - 125, 300, 250, 70, "New Game", "menu"),
    //new Button(canvas.width * 0.5 - 125, 400, 190, 70, "New Score", "menu"),
    //new Button(canvas.width * 0.1, 60, 70, 70, "Settings", "menu"),

    //new Button(canvas.width * 0.5 - 125, canvas.height-200, 250, 70, "Back", "game", () => switchScene("menu")),

]

let pieces = [];
function resetBoard() {

    pieces = [
        new Piece(1,0, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(3,0, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(5,0, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(7,0, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(0,1, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(2,1, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(4,1, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(6,1, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(1,2, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(3,2, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(5,2, 580 / 8, 580 / 8, "black", images.blackPiece),
        new Piece(7,2, 580 / 8, 580 / 8, "black", images.blackPiece),

        new Piece(0,7, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(2,7, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(4,7, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(6,7, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(1,6, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(3,6, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(5,6, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(7,6, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(0,5, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(2,5, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(4,5, 580 / 8, 580 / 8, "white", images.whitePiece),
        new Piece(6,5, 580 / 8, 580 / 8, "white", images.whitePiece),

    ]
}
resetBoard();


function drawProgressBar() {
    ctx.save(); // Save the current context state

    const x = canvas.width / 2 + 320; // Position
    const y = 460;
    const width = 350;
    const height = 80;
    const borderRadius = height / 2;
    let progress = 0.69; // 69% progress

    // Draw outer capsule (background with shadow)
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

    // Draw inner capsule (progress bar, slightly smaller)
    const insetPadding = 6;
    const innerHeight = height - insetPadding * 2;
    const innerWidth = (width - insetPadding * 2) * progress;
    const innerRadius = innerHeight / 2;

    ctx.fillStyle = "#C8D093"; // Green progress
    ctx.beginPath();
    ctx.roundRect(
        x - width / 2 + insetPadding,
        y + insetPadding,
        innerWidth,
        innerHeight,
        innerRadius
    );
    ctx.fill();

    // Draw progress text
    ctx.fillStyle = "black";
    ctx.font = "30px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(progress * 100) + "%", x, y + height / 2);
    ctx.restore(); // Restore original context state

}

function  drawBoard(x, y, width, height){
    ctx.drawImage(images.board, 20, 20, 580, 580);
}

function boardLogic(mouseX, mouseY){
    console.log("Logic here");
}
function renderMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
    //ctx.fillStyle = "white";
    //ctx.fillRect(0, 0, canvas.width, canvas.height); // Background for menu

    // ctx.font = "80px Comic Sans MS";
    // ctx.fillStyle = "white";
    // ctx.textAlign = "center";
    // ctx.shadowColor = "black";     // Shadow color
    // ctx.shadowBlur = 10;           // Blur level
    // ctx.shadowOffsetX = 4;         // Horizontal offset
    // ctx.shadowOffsetY = 4;         // Vertical offset
    //
    // ctx.fillText("Checkers Bot", canvas.width / 2, 350);
    //
    // ctx.shadowColor = "transparent";
    // ctx.shadowBlur = 0;
    // ctx.shadowOffsetX = 0;
    // ctx.shadowOffsetY = 0;

    ctx.drawImage(images.naming, canvas.width / 2-350, 270, 700, 100);



    buttons.forEach((button) => button.drow(ctx));
}
function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
    drawBoard(20, 20, 580, 580);

    ctx.drawImage(images.naming, canvas.width / 2+100, 70, 220, 40);
    //ctx.drawImage(images.board, 20, 20, 580, 580);
    ctx.drawImage(images.your_turn, canvas.width / 2 + 220, 400, 200, 50)

    drawProgressBar();

    buttons.forEach((button) => button.drow(ctx));
    pieces.forEach((piece) => piece.draw(20, 20));

    ctx.drawImage(images.dificulty_avatar, canvas.width / 2 + 150, 220, 90, 150)

    // draw board

    // manage clicks


    // call the function for logic

    //drawBoard();
    //drawPieces();
    //drawText(); // Draw the text after board and pieces
    //drawFlag();
    //drawProgressBar(); // Call progress bar function
    //footer.draw(ctx);
}





// Initialize the game after all images are loaded
const imageLoadPromises = Object.values(images).map(image =>
    new Promise(resolve => image.onload = resolve)
);

Promise.all(imageLoadPromises).then(renderMenu);

canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    buttons.forEach(button => {
        if (button.scene === currentScene && button.isClicked(mouseX, mouseY)) {
            console.log("Clicked button:", button.text);
            if (button.onClick) button.onClick(); // Call its handler
        }
    });
    pieces.forEach(piece => {
        if ("game" === currentScene && piece.isClicked(mouseX, mouseY)) {
            console.log("Clicked piece:", piece);
            piece.select();
        }
    });
});

canvas.addEventListener("mousemove", function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let hovering = false;
    buttons.forEach(button => {
        if (button.scene === currentScene && button.isClicked(mouseX, mouseY)) {
            hovering = true;
        }
    });
    pieces.forEach(piece => {
        if ("game" === currentScene && piece.isClicked(mouseX, mouseY)) {
            hovering = true;
        }
    });

    canvas.style.cursor = hovering ? "pointer" : "default";
});
