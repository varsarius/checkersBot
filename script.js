// checkers.js
// ----------------------
//  LOGIC LAYER (Model / Strategy)
// ----------------------

class Board {
    constructor() {
        this.board = this.createBoard();
    }
    createBoard() {
        return [
            [0,2,0,2,0,2,0,2],
            [2,0,2,0,2,0,2,0],
            [0,2,0,2,0,2,0,2],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1],
            [1,0,1,0,1,0,1,0]
        ];
    }
    get(r, c) {
        return this.board[r][c];
    }
    set(r, c, value) {
        this.board[r][c] = value;
    }
}

class AI {
    constructor(board) {
        this.board = board;
    }
    // Return all capture chains for the given piece
    findMultiAttacks(r, c, visited = new Set()) {
        const me    = this.board.get(r, c);
        const isKing = me === 4;
        const enemy = (x) => x === 1 || x === 3;
        const dirs  = [[-1,-1],[-1,1],[1,-1],[1,1]];
        let out = [];

        for (let [dr, dc] of dirs) {
            if (!isKing) {
                const mr = r + dr, mc = c + dc, er = r + 2 * dr, ec = c + 2 * dc;
                if (er < 0 || er > 7 || ec < 0 || ec > 7) continue;
                if (enemy(this.board.get(mr, mc)) && this.board.get(er, ec) === 0) {
                    const key = `${mr},${mc}`;
                    if (visited.has(key)) continue;
                    let nv = new Set(visited);
                    nv.add(key);
                    let fut = this.findMultiAttacks(er, ec, nv);
                    if (fut.length) {
                        for (let p of fut) out.push([[r, c], [er, ec], ...p.slice(1)]);
                    } else {
                        out.push([[r, c], [er, ec]]);
                    }
                }
            } else {
                let i = 1;
                while (true) {
                    const mr = r + i * dr, mc = c + i * dc;
                    if (mr < 0 || mr > 7 || mc < 0 || mc > 7) break;
                    if (this.board.get(mr, mc) === 0) { i++; continue; }
                    if (!enemy(this.board.get(mr, mc))) break;
                    let j = 1;
                    while (true) {
                        const er = mr + j * dr, ec = mc + j * dc;
                        if (er < 0 || er > 7 || ec < 0 || ec > 7) break;
                        if (this.board.get(er, ec) !== 0) break;
                        const key = `${mr},${mc}`;
                        if (!visited.has(key)) {
                            let nv = new Set(visited);
                            nv.add(key);
                            let fut = this.findMultiAttacks(er, ec, nv);
                            if (fut.length) {
                                for (let p of fut) {
                                    out.push([[r, c], [er, ec], ...p.slice(1)]);
                                }
                            } else {
                                out.push([[r, c], [er, ec]]);
                            }
                        }
                        j++;
                    }
                    break;
                }
            }
        }
        return out;
    }
    // This function may later be modified to return all available chains for user choice
    getMoveChain() {
        const capChains = [];
        // loop through all pieces for the AI side (value 2 or 4)
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board.get(r, c) !== 2 && this.board.get(r, c) !== 4) continue;
                const chains = this.findMultiAttacks(r, c);
                if (chains.length) capChains.push(...chains);
            }
        }
        if (capChains.length) {
            // For AI we choose one chain randomly; this could be improved without affecting the UI
            return capChains[Math.floor(Math.random() * capChains.length)];
        }
        // If no capture, return a random slide move (this logic can be refined as needed)
        return this.getRandomMove();
    }
    getRandomMove() {
        let normalMoves = [];
        const allDirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
        const forwardDirs = [[1,-1],[1,1]];
        const isKing = (v) => v === 4;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const v = this.board.get(r, c);
                if (v !== 2 && v !== 4) continue;
                const dirs = isKing(v) ? allDirs : forwardDirs;
                for (let [dr, dc] of dirs) {
                    let nr = r + dr, nc = c + dc;
                    if (!isKing(v)) {
                        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && this.board.get(nr, nc) === 0) {
                            normalMoves.push([[r, c], [nr, nc]]);
                        }
                    } else {
                        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && this.board.get(nr, nc) === 0) {
                            normalMoves.push([[r, c], [nr, nc]]);
                            nr += dr;
                            nc += dc;
                        }
                    }
                }
            }
        }
        if (normalMoves.length) return normalMoves[Math.floor(Math.random() * normalMoves.length)];
        return null;
    }
}

class PlayerLogic {
    constructor(board) {
        this.board = board;
    }
    findMultiAttacks(r, c, visited = new Set()) {
        const me     = this.board.get(r, c);
        const isKing = me === 3;
        const enemy  = x => x === 2 || x === 4;
        const dirs   = [[-1,-1],[-1,1],[1,-1],[1,1]];
        let out = [];
        for (let [dr, dc] of dirs) {
            if (!isKing) {
                const mr = r + dr, mc = c + dc, er = r + 2 * dr, ec = c + 2 * dc;
                if (er < 0 || er > 7 || ec < 0 || ec > 7) continue;
                if (enemy(this.board.get(mr, mc)) && this.board.get(er, ec) === 0) {
                    const key = `${mr},${mc}`;
                    if (visited.has(key)) continue;
                    let nv = new Set(visited);
                    nv.add(key);
                    let fut = this.findMultiAttacks(er, ec, nv);
                    if (fut.length) {
                        for (let p of fut) out.push([[r, c], [er, ec], ...p.slice(1)]);
                    } else {
                        out.push([[r, c], [er, ec]]);
                    }
                }
            } else {
                let i = 1;
                while (true) {
                    const mr = r + i * dr, mc = c + i * dc;
                    if (mr < 0 || mr > 7 || mc < 0 || mc > 7) break;
                    if (this.board.get(mr, mc) === 0) { i++; continue; }
                    if (!enemy(this.board.get(mr, mc))) break;
                    let j = 1;
                    while (true) {
                        const er = mr + j * dr, ec = mc + j * dc;
                        if (er < 0 || er > 7 || ec < 0 || ec > 7) break;
                        if (this.board.get(er, ec) !== 0) break;
                        const key = `${mr},${mc}`;
                        if (!visited.has(key)) {
                            let nv = new Set(visited);
                            nv.add(key);
                            let fut = this.findMultiAttacks(er, ec, nv);
                            if (fut.length) {
                                for (let p of fut) out.push([[r, c], [er, ec], ...p.slice(1)]);
                            } else {
                                out.push([[r, c], [er, ec]]);
                            }
                        }
                        j++;
                    }
                    break;
                }
            }
        }
        return out;
    }
    // Check if any mandatory capture is present (to enforce rules)
    hasMandatory() {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const v = this.board.get(r, c);
                if (v !== 1 && v !== 3) continue;
                if (this.findMultiAttacks(r, c).length) return true;
            }
        }
        return false;
    }
    // Returns a valid move chain based on the attempted start and end locations.
    // Later you can modify this to return multiple options for the UI to let the user choose.
    // Returns a valid move chain based on the attempted start and end locations.
    getMoveChain(start, end) {
        // 1) Try to find a capture chain first
        let chains = this.findMultiAttacks(...start);
        // Find a chain starting with the intended target
        let chain = chains.find(ch => ch[1][0] === end[0] && ch[1][1] === end[1]);
        if (chain) return chain;

        // 2) If no capture is forced, allow a simple move.
        // Only allow simple moves if no mandatory capture exists.
        if (!this.hasMandatory()) {
            const [r1, c1] = start;
            const [r2, c2] = end;
            const piece = this.board.get(r1, c1);
            // Check that the destination square is empty
            if (this.board.get(r2, c2) === 0) {
                // For a regular man (piece value 1) allow only one step upward.
                if (piece === 1) {
                    if (r2 === r1 - 1 && Math.abs(c2 - c1) === 1) {
                        return [[r1, c1], [r2, c2]];
                    }
                }
                // For a king (piece value 3) allow any diagonal move if the path is clear.
                else if (piece === 3) {
                    const dr = r2 - r1;
                    const dc = c2 - c1;
                    // Must be a diagonal move (and not zero-length)
                    if (Math.abs(dr) === Math.abs(dc) && Math.abs(dr) > 0) {
                        // Determine the direction of travel
                        const stepR = dr > 0 ? 1 : -1;
                        const stepC = dc > 0 ? 1 : -1;
                        let valid = true;
                        // Check every square in between (excluding start and destination)
                        for (let i = 1; i < Math.abs(dr); i++) {
                            const rr = r1 + i * stepR;
                            const cc = c1 + i * stepC;
                            if (this.board.get(rr, cc) !== 0) {
                                valid = false;
                                break;
                            }
                        }
                        if (valid) return [[r1, c1], [r2, c2]];
                    }
                }
            }
        }
        return null;
    }
}


// ----------------------
//    UI LAYER (Canvas)
// ----------------------

const CANVAS_WIDTH=1024, CANVAS_HEIGHT=768;
const BOARD_X=5, BOARD_Y=20, BOARD_PIX=580, TILE=BOARD_PIX/8;

const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
canvas.width=CANVAS_WIDTH; canvas.height=CANVAS_HEIGHT;

// load all images exactly as before
const images={
    whiteTile:        loadImg("./img/white_block.png"),
    blackTile:        loadImg("./img/black_block.png"),
    redPiece:         loadImg("./img/white.png"),
    blackPiece:       loadImg("./img/blackPiece.png"),
    blackPieceKing:   loadImg("./img/blackPieceKing.png"),
    flagImage:        loadImg("./img/flag.png"),
    logo:             loadImg("./img/logo.png"),
    settings:         loadImg("./img/settings_btn.png"),
    profile:          loadImg("./img/profile_btn.png"),
    qa:               loadImg("./img/QA_button.png"),
    new_game_button:  loadImg("./img/new_game_button.png"),
    naming:           loadImg("./img/Naming.png"),
    board:            loadImg("./img/boarf.png"),
    difficulty:       loadImg("./img/buttondifficulty.png"),
    your_turn:        loadImg("./img/Your turn.png"),
    dificulty_avatar: loadImg("./img/deda.png"),
    menu_button:      loadImg("./img/menu_button.png"),
    whitePiece:       loadImg("./img/whitePiece.png"),
    whitePieceKing:   loadImg("./img/whitePieceKing.png"),
    play_btn:         loadImg("./img/play_btn.png"),
    new_game_btn:     loadImg("./img/new_game_btn.png"),
    your_score_btn:   loadImg("./img/your_score_btn.png"),
    on_off_btn:       loadImg("./img/on_off_btn.png"),
};
function loadImg(src){ let i=new Image(); i.src=src; return i; }

class Button {
    constructor(x,y,w,h,text,scene,onClick=null,img=null,fs=40,c="#4CAF50",tc="white"){
        Object.assign(this,{x,y,w,h,text,scene,onClick,img,fs,c,tc});
    }
    draw(){
        if(currentScene!==this.scene) return;
        ctx.save();
        if(this.img){
            ctx.drawImage(this.img,this.x,this.y,this.w,this.h);
        } else {
            ctx.fillStyle=this.c;
            ctx.beginPath();
            ctx.roundRect(this.x,this.y,this.w,this.h,this.h/2);
            ctx.fill();
            ctx.textAlign="center";
            ctx.font=`bold ${this.fs}px Impact, Arial Black, Comic Sans MS`;
            ctx.fillStyle=this.tc;
            ctx.strokeStyle="white"; ctx.lineWidth=6;
            ctx.translate(this.x+this.w/2,this.y+this.h/1.5);
            ctx.scale(1.15,1);
            ctx.strokeText(this.text,0,0);
            ctx.fillText(this.text,0,0);
        }
        ctx.restore();
    }
    isClicked(mx,my){
        return mx>=this.x&&mx<=this.x+this.w&&my>=this.y&&my<=this.y+this.h;
    }
}

class Piece {
    constructor(row,col,type,img){
        Object.assign(this,{row,col,type,img});
        this.selected=false;
        this.isMoving=false; this.moveProgress=0;
        this.startRow=0; this.startCol=0;
        this.targetRow=0; this.targetCol=0;
    }
    draw(){
        if(currentScene!=="game") return;
        let x,y;
        if(this.isMoving){
            let sx=BOARD_X+this.startCol*TILE,
                sy=BOARD_Y+this.startRow*TILE,
                ex=BOARD_X+this.targetCol*TILE,
                ey=BOARD_Y+this.targetRow*TILE;
            x=sx+(ex-sx)*this.moveProgress;
            y=sy+(ey-sy)*this.moveProgress;
        } else {
            x=BOARD_X+this.col*TILE;
            y=BOARD_Y+this.row*TILE;
        }
        let p= 5;
        ctx.drawImage(this.img,x+p,y+p,TILE-2*p,TILE-2*p);
        if(this.selected){
            ctx.strokeStyle="yellow"; ctx.lineWidth=4; //#c3b3d5
            ctx.strokeRect(x,y,TILE,TILE);
        }
    }
    startMove(toRow,toCol){
        this.startRow=this.row; this.startCol=this.col;
        this.targetRow=toRow; this.targetCol=toCol;
        this.isMoving=true; this.moveProgress=0;
    }
    update(dt){
        if(!this.isMoving) return;
        this.moveProgress += dt/500;
        if(this.moveProgress>=1){
            this.moveProgress=1;
            this.isMoving=false;
            this.row=this.targetRow;
            this.col=this.targetCol;
        }
    }
    isClicked(mx,my){
        let x=BOARD_X+this.col*TILE,
            y=BOARD_Y+this.row*TILE;
        return mx>=x&&mx<x+TILE&&my>=y&&my<y+TILE;
    }
    select(){
        pieces.forEach(p=>p.selected=false);
        this.selected=true;
    }
}

// game state
let currentScene="menu";
let boardLogic=new Board();
let aiLogic=new AI(boardLogic);
let plLogic=new PlayerLogic(boardLogic);
let pieces=[];
let selectedPiece=null;

// animation queue
let animQueue=[], animating=false, currentAnim=null, waitingForCompletion=false;

function enqueueAnimation(chain, value){
    // chain = [[r,c],...]
    animQueue=[];
    for(let i=0;i<chain.length-1;i++){
        let [r1,c1]=chain[i], [r2,c2]=chain[i+1];
        let cap = Math.abs(r2-r1)===2 ? [(r1+r2)/2|0,(c1+c2)/2|0] : null;
        animQueue.push({from:[r1,c1],to:[r2,c2],capture:cap,value});
    }
    animating=true;
    runNextAnim();
}

function runNextAnim(){
    if(animQueue.length===0){
        currentAnim=null; animating=false;
        // if it was player, trigger AI
        if(currentAnimValue===1){
            let chain=aiLogic.getMoveChain();
            if(chain) enqueueAnimation(chain,2);
        }
        return;
    }
    currentAnim=animQueue.shift();
    currentAnimValue=currentAnim.value;
    let [r,c]=currentAnim.from;
    let p=pieces.find(x=>x.row===r&&x.col===c);
    if(!p) { runNextAnim(); return; }
    p.startMove(...currentAnim.to);
    waitingForCompletion=true;
}

function completeCurrentAnim(){
    let { from, to, capture, value } = currentAnim;

    // 1) remove from‐square
    boardLogic.set(...from, 0);

    // 2) decide if we crown
    let newVal = value;
    // black man (2) reaching row 7 → black king (4)
    if (value === 2 && to[0] === 7) newVal = 4;
    // white man (1) reaching row 0 → white king (3)
    if (value === 1 && to[0] === 0) newVal = 3;

    // 3) set into‐square (with crowned value)
    boardLogic.set(...to, newVal);

    // 4) clear any capture
    if (capture) boardLogic.set(...capture, 0);

    // 5) remove captured piece from UI
    if (capture) {
        pieces = pieces.filter(p =>
            !(p.row === capture[0] && p.col === capture[1])
        );
    }

    // 6) update the moving Piece object’s type & img if crowned
    //    after update(), the piece will have row/to[0], col/to[1]
    let moved = pieces.find(p => p.row === to[0] && p.col === to[1]);
    if (moved) {
        if (newVal === 4) {
            moved.type = "blackKing";
            moved.img  = images.blackPieceKing;
        } else if (newVal === 3) {
            moved.type = "whiteKing";
            moved.img  = images.whitePieceKing;
        }
    }

    waitingForCompletion = false;
    runNextAnim();
}


function syncPieces(){
    // only called on new game or scene changes
    pieces=[];
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){
        let v=boardLogic.get(r,c);
        if(v===1) pieces.push(new Piece(r,c,"white",images.whitePiece));
        if(v===2) pieces.push(new Piece(r,c,"black",images.blackPiece));
        if(v===3) pieces.push(new Piece(r,c,"whiteKing",images.whitePieceKing));
        if(v===4) pieces.push(new Piece(r,c,"blackKing",images.blackPieceKing));
    }
}

// buttons (as before) …
const buttons=[
    new Button(canvas.width/2-125,20,250,250,"Flag","menu",()=>switchScene("game"),images.logo),
    new Button(20,20,90,90,"Settings","menu",()=>switchScene("settings"),images.settings),
    new Button(canvas.width-110,20,90,90,"Profile","menu",()=>switchScene("profile"),images.profile),
    new Button(canvas.width-110,canvas.height-110,90,90,"QA","menu",()=>switchScene("qa"),images.qa),
    new Button(canvas.width/2-150,canvas.height/2,300,70,"Play","menu",()=>{
        switchScene("game"); boardLogic=new Board(); aiLogic=new AI(boardLogic); plLogic=new PlayerLogic(boardLogic); syncPieces();
    },images.play_btn,40,"#A6BFDB","#6A8CBB"),
    new Button(canvas.width/2-150,canvas.height/2+92,300,70,"New Game","menu",()=>{
        boardLogic=new Board(); aiLogic=new AI(boardLogic); plLogic=new PlayerLogic(boardLogic); syncPieces(); switchScene("game");
    },images.new_game_btn,40,"#A6BFDB","#6A8CBB"),
    new Button(canvas.width/2-150,canvas.height/2+184,300,70,"Your Score","menu",()=>switchScene("game"),images.your_score_btn,40,"#A6BFDB","#6A8CBB"),

    new Button(canvas.width-170,20,150,150,"Flag","game",()=>switchScene("menu"),images.logo),
    new Button(canvas.width/2+150,270,350,100,"Difficulty","game",null,images.difficulty),
    new Button(10,canvas.height-100,300,70,"Menu","game",()=>switchScene("menu"),images.menu_button,40,"#A6BFDB","#6A8CBB"),
    new Button(340,canvas.height-100,300,70,"New Game","game",()=>{
        boardLogic=new Board(); aiLogic=new AI(boardLogic); plLogic=new PlayerLogic(boardLogic); syncPieces();
    },images.new_game_button,40,"#A6BFDB","#6A8CBB"),
    new Button(canvas.width-110,canvas.height-110,90,90,"QA","game",()=>switchScene("qa"),images.qa),


    new Button(canvas.width/2-20,canvas.height/2-40,270,100,"on_sound_setting","settings",()=>console.log("clicked on volume_setting"),images.on_off_btn),
];

function switchScene(s){
    currentScene=s;
}

// draw helpers
function drawBoard(){ ctx.drawImage(images.board,BOARD_X,BOARD_Y,BOARD_PIX,BOARD_PIX); }
function drawProgress(){
    const x=canvas.width/2+320,y=460,w=350,h=80,br=h/2,pad=6,p=0.49;
    ctx.save();
    ctx.fillStyle="white"; ctx.shadowColor="rgba(0,0,0,0.3)"; ctx.shadowBlur=15; ctx.shadowOffsetY=5;
    ctx.beginPath(); ctx.roundRect(x-w/2,y,w,h,br); ctx.fill();
    ctx.restore();
    ctx.fillStyle="#C8D093";
    ctx.beginPath(); ctx.roundRect(x-w/2+pad,y+pad,(w-pad*2)*p,h-pad*2,(h-pad*2)/2); ctx.fill();
    ctx.fillStyle="black"; ctx.font="30px Comic Sans MS"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(Math.round(p*100)+"%",x,y+h/2);
}

// main loop
let last=0;
function gameLoop(ts){
    const dt=ts-last; last=ts;
    // update animations
    pieces.forEach(p=>p.update(dt));
    if(waitingForCompletion && currentAnim){
        // find the moving piece
        let mp=pieces.find(p=>p.row===currentAnim.to[0]&&p.col===currentAnim.to[1]&& !p.isMoving);
        if(mp) completeCurrentAnim();
    }
    // draw
    ctx.clearRect(0,0,canvas.width,canvas.height);
    buttons.forEach(b=>b.draw());
    if(currentScene==="menu"){
        ctx.drawImage(images.naming,canvas.width/2-350,270,700,100);
    } else if(currentScene==="game"){
        drawBoard();
        pieces.forEach(p=>p.draw());
        ctx.drawImage(images.naming,canvas.width/2+100,70,220,40);
        ctx.drawImage(images.your_turn,canvas.width/2+220,400,200,50);
        ctx.drawImage(images.dificulty_avatar,canvas.width/2+150,220,90,150);
        drawProgress();
    } else if (currentScene==="settings"){

    }
    requestAnimationFrame(gameLoop);
}

// input
canvas.addEventListener("click",e=>{
    if(animating) return; // ignore while animating
    let rct=canvas.getBoundingClientRect();
    let mx=e.clientX-rct.left, my=e.clientY-rct.top;
    // buttons
    for(let b of buttons){
        if(b.scene===currentScene && b.isClicked(mx,my) && b.onClick){
            b.onClick();
            return;
        }
    }
    if(currentScene==="game"){
        // select
        let hit=pieces.find(p=>p.isClicked(mx,my)&&(p.type==="white" || p.type==="whiteKing"));
        if(hit){
            // pieces.forEach(p=>p.selected=false);
            // hit.selected=true;
            selectedPiece=hit;
            hit.select();
            return;
        }
        // move
        if(selectedPiece){
            let tr=Math.floor((my-BOARD_Y)/TILE),
                tc=Math.floor((mx-BOARD_X)/TILE);
            let chain=plLogic.getMoveChain([selectedPiece.row,selectedPiece.col],[tr,tc]);
            if(chain){
                enqueueAnimation(chain,1);
            }
            pieces.forEach(p=>p.selected=false);
            selectedPiece=null;
        }
    }
});

// start
Promise.all(Object.values(images).map(img=>new Promise(r=>img.onload=r)))
    .then(()=>{
        syncPieces();
        requestAnimationFrame(gameLoop);
    });
