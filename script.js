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
};

// Assign sources
images.whiteTile.src = "./img/white_block.png";  // Light tile
images.blackTile.src = "./img/black_block.png";  // Dark tile
images.redPiece.src = "./img/white.png";         // Assuming this represents red pieces
images.blackPiece.src = "./img/black.png";       // Black pieces
images.flagImage.src = "./img/flag.png";         // Assign an actual file path
images.logo.src = "./img/logo.png";
images.settings.src = "./img/QA_button.png";
images.profile.src = "./img/QA_button.png";
images.qa.src = "./img/QA_button.png";
images.new_game_button.src = "./img/new_game_button.png";
images.naming.src = "./img/Naming.png";
images.board.src = "./img/boarf.png";
images.difficulty.src = "./img/buttondifficulty.png";
images.your_turn.src = "./img/Your turn.png"
images.dificulty_avatar.src = "./img/boarf.png";
images.menu_button.src = "./img/menu_button.png";


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

let buttons = [
    // menu scene
    new Button(canvas.width * 0.5 - 125, 20, 250, 250, "Flag", "menu", () => switchScene("game"), images.logo),
    new Button(20, 20, 90, 90, "Settings", "menu", () => switchScene("settings"), images.settings),
    new Button(canvas.width - 20 - 90, 20, 90, 90, "Profile", "menu", () => switchScene("profile"), images.profile),
    new Button(canvas.width - 20 - 90, canvas.height - 20 - 90, 90, 90, "qa", "menu", () => switchScene("qa"), images.qa),

    new Button(canvas.width / 2 - 150, canvas.height / 2, 300, 70, "Play", "menu", () => switchScene("game"), null, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 92, 300, 70, "New Game", "menu", () => switchScene("game"), images.new_game_button, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 92 + 92, 300, 70, "Your Score", "menu", () => switchScene("game"), null, 40, "#A6BFDB", "#6A8CBB"),

    // game scene
    new Button(canvas.width - 170, 20, 150, 150, "Flag", "game", () => switchScene("menu"), images.logo),
    new Button(canvas.width / 2 + 150, 270, 350, 100, "Difficulty", "game", () => switchScene("game"), images.difficulty),

    new Button(30, canvas.height - 112, 300, 70, "Manu", "game", () => switchScene("menu"), images.menu_button, 40, "#A6BFDB", "#6A8CBB"),

    //new Button(canvas.width * 0.5 - 125, 300, 250, 70, "New Game", "menu"),
    //new Button(canvas.width * 0.5 - 125, 400, 190, 70, "New Score", "menu"),
    //new Button(canvas.width * 0.1, 60, 70, 70, "Settings", "menu"),

    //new Button(canvas.width * 0.5 - 125, canvas.height-200, 250, 70, "Back", "game", () => switchScene("menu")),

]

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

    ctx.drawImage(images.naming, canvas.width / 2+100, 70, 220, 40);
    ctx.drawImage(images.board, 20, 20, 580, 580);
    ctx.drawImage(images.your_turn, canvas.width / 2 + 220, 400, 200, 50)

    drawProgressBar();

    buttons.forEach((button) => button.drow(ctx));
    ctx.drawImage(images.dificulty_avatar, canvas.width / 2 + 150, 170, 90, 200)


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

    canvas.style.cursor = hovering ? "pointer" : "default";
});
