// ----------------------
//  LOGIC LAYER (Model / Strategy)
// ----------------------

// Updated Board class with a clone() method and promotion logic.
class Board {
    constructor() {
        this.board = this.createBoard();
    }
    createBoard() {
        // 0: empty, 1: player piece, 2: AI piece, 3: player king, 4: AI king
        return [
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            // [0, 3, 0, 2, 0, 2, 0, 2],
            // [1, 0, 2, 0, 2, 0, 2, 0],
            // [0, 0, 0, 0, 0, 2, 0, 2],
            // [0, 0, 2, 0, 2, 0, 0, 0],
            // [0, 0, 0, 0, 0, 0, 0, 0],
            // [1, 0, 1, 0, 1, 0, 1, 0],
            // [0, 1, 0, 1, 0, 1, 0, 1],
            // [1, 0, 1, 0, 1, 0, 1, 0],
        ];
    }
    get(r, c) {
        return this.board[r][c];
        //requestAnimationFrame(gameLoop); // temp
    }
    set(r, c, value, moving = null) {

        //requestAnimationFrame(gameLoop); // temp

        // if(moving !== true){
        //     if(value === 0){
        //         pieces = pieces.filter(p => !(p.row === r && p.col === c));
        //     }
        //     if ((this.board[r][c] ===0) && (value !== 0)){
        //         if (value === 1) pieces.push(new Piece(r, c, "white", images.whitePiece));
        //         if (value === 2) pieces.push(new Piece(r, c, "black", images.blackPiece));
        //         if (value === 3) pieces.push(new Piece(r, c, "whiteKing", images.whitePieceKing));
        //         if (value === 4) pieces.push(new Piece(r, c, "blackKing", images.blackPieceKing));
        //     }
        // }
        //
        this.board[r][c] = value;


    }
    move(r1, c1, r2, c2) {
        const pieceValue = this.get(r1, c1);
        enqueueAnimation([[r1, c1], [r2, c2]], pieceValue);
    }

    clicked(r, c) {
        if (currentScene !== "game") return;
        // Если сейчас анимация – игнорим клики
        if (animating) return;

        // 1) Клик по своей шашке?
        const hit = pieces.find(p =>
            p.row === r && p.col === c &&
            (p.type === "white" || p.type === "whiteKing")
        );
        if (hit) {
            // выбираем шашку
            selectedPiece = hit;
            hit.select();
            return;
        }

        // 2) Если шашка уже выбрана – пробуем получить цепочку хода
        if (selectedPiece) {
            const start = [selectedPiece.row, selectedPiece.col];
            const end   = [r, c];
            const chain = plLogic.getMoveChain(start, end);

            if (chain) {
                enqueueAnimation(chain, 1);
            }

            // выводим в консоль
            console.log(
                "Активная шашка:", start,
                "→ Цель хода:", end
            );

            // сброс выделения
            pieces.forEach(p => p.selected = false);
            selectedPiece = null;
        }
    }

    // Create a deep clone of the board (used for simulating moves).
    clone() {
        const newBoard = new Board();
        newBoard.board = this.board.map(row => row.slice());
        return newBoard;
    }
    // Promote pieces that reach the opposite end.
    promoteKings() {
        // Player: piece 1 reaching row 0 becomes king (3).
        for (let col = 0; col < 8; col++) {
            if (this.board[0][col] === 1) {
                this.board[0][col] = 3;
            }
        }
        // AI: piece 2 reaching row 7 becomes king (4).
        for (let col = 0; col < 8; col++) {
            if (this.board[7][col] === 2) {
                this.board[7][col] = 4;
            }
        }
    }
}

//
// ----------------------
//  AI LOGIC CLASS (Updated)
// ----------------------
// GLOBAL VARIAVBLE
let difficulty = 1;
class AI {
    constructor(board) {
        this.board = board;
        this.depth = 4; // Depth for minimax search
    }

    getMoveChain() {
        if (difficulty === 1) {
            return this.getRandomMove();
        } else if (difficulty === 2) {
            return this.getBestMove();
        } else if (difficulty === 3) {
            return this.getMinimaxMove();
        }
        return null;
    }

    // Difficulty 1: Random move
    getRandomMove() {
        // Check for capture chains first (mandatory in checkers)
        const captureChains = this.findAllCaptureChains('AI');
        if (captureChains.length > 0) {
            // Randomly select a capture chain
            return captureChains[Math.floor(Math.random() * captureChains.length)];
        }

        // If no captures, select a random non-capture move
        const moves = [];
        const allDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        const forwardDirs = [[1, -1], [1, 1]]; // AI moves down
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board.get(r, c);
                if (piece === 2 || piece === 4) {
                    const dirs = piece === 4 ? allDirs : forwardDirs;
                    for (const [dr, dc] of dirs) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (this.isWithinBounds(nr, nc) && this.board.get(nr, nc) === 0) {
                            moves.push([[r, c], [nr, nc]]);
                        }
                    }
                }
            }
        }
        return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
    }

    // Difficulty 2: Strategic move with captures
    getBestMove() {
        const captureChains = this.findAllCaptureChains('AI');
        if (captureChains.length > 0) {
            const maxLength = Math.max(...captureChains.map(chain => chain.length));
            const bestChains = captureChains.filter(chain => chain.length === maxLength);
            return bestChains[Math.floor(Math.random() * bestChains.length)];
        }
        return this.getStrategicMove();
    }

    // Difficulty 3: Minimax with Alpha-Beta Pruning
    getMinimaxMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        const moves = this.generateMoves(this.board, 'AI'); // Fixed: Pass this.board
        for (const move of moves) {
            const clonedBoard = this.board.clone();
            this.applyMoveChain(clonedBoard, move, 'AI');
            const score = this.minimax(clonedBoard, this.depth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    minimax(board, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluate(board);
        }
        const player = isMaximizing ? 'AI' : 'player';
        const moves = this.generateMoves(board, player);
        if (moves.length === 0) {
            return isMaximizing ? -1000 : 1000; // No moves means loss
        }
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                const clonedBoard = board.clone();
                this.applyMoveChain(clonedBoard, move, 'AI');
                const score = this.minimax(clonedBoard, depth - 1, alpha, beta, false);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                const clonedBoard = board.clone();
                this.applyMoveChain(clonedBoard, move, 'player');
                const score = this.minimax(clonedBoard, depth - 1, alpha, beta, true);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    generateMoves(board, player) {
        const captureChains = this.findAllCaptureChains(player, board);
        return captureChains.length > 0 ? captureChains : this.findAllNonCaptureMoves(player, board);
    }

    findAllCaptureChains(player, boardInst = this.board) {
        const ownPieces = player === 'AI' ? [2, 4] : [1, 3];
        const allChains = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardInst.get(r, c);
                if (ownPieces.includes(piece)) {
                    const chains = this.findMultiAttacks(player, r, c, piece, new Set(), boardInst);
                    allChains.push(...chains);
                }
            }
        }
        return allChains;
    }

    findMultiAttacks(player, r, c, piece, visited, boardInst) {
        const isKing = (piece === 3 || piece === 4);
        const enemyPieces = player === 'AI' ? [1, 3] : [2, 4];
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        const chains = [];
        for (const [dr, dc] of dirs) {
            if (!isKing) {
                const midR = r + dr;
                const midC = c + dc;
                const endR = r + 2 * dr;
                const endC = c + 2 * dc;
                if (this.isValidCapture(player, midR, midC, endR, endC, boardInst)) {
                    const key = `${endR},${endC}`;
                    if (!visited.has(key)) {
                        const newVisited = new Set(visited);
                        newVisited.add(key);
                        const clonedBoard = boardInst.clone();
                        clonedBoard.set(r, c, 0);
                        clonedBoard.set(midR, midC, 0);
                        clonedBoard.set(endR, endC, piece);
                        const furtherChains = this.findMultiAttacks(player, endR, endC, piece, newVisited, clonedBoard);
                        if (furtherChains.length > 0) {
                            for (const chain of furtherChains) {
                                chains.push([[r, c], [endR, endC], ...chain.slice(1)]);
                            }
                        } else {
                            chains.push([[r, c], [endR, endC]]);
                        }
                    }
                }
            } else {
                let i = 1;
                while (this.isWithinBounds(r + i * dr, c + i * dc)) {
                    const midR = r + i * dr;
                    const midC = c + i * dc;
                    if (boardInst.get(midR, midC) === 0) {
                        i++;
                        continue;
                    }
                    if (enemyPieces.includes(boardInst.get(midR, midC))) {
                        let j = 1;
                        while (this.isWithinBounds(midR + j * dr, midC + j * dc)) {
                            const endR = midR + j * dr;
                            const endC = midC + j * dc;
                            if (boardInst.get(endR, endC) !== 0) break;
                            const key = `${endR},${endC}`;
                            if (!visited.has(key)) {
                                const newVisited = new Set(visited);
                                newVisited.add(key);
                                const clonedBoard = boardInst.clone();
                                clonedBoard.set(r, c, 0);
                                clonedBoard.set(midR, midC, 0);
                                clonedBoard.set(endR, endC, piece);
                                const furtherChains = this.findMultiAttacks(player, endR, endC, piece, newVisited, clonedBoard);
                                if (furtherChains.length > 0) {
                                    for (const chain of furtherChains) {
                                        chains.push([[r, c], [endR, endC], ...chain.slice(1)]);
                                    }
                                } else {
                                    chains.push([[r, c], [endR, endC]]);
                                }
                            }
                            j++;
                        }
                    }
                    break;
                }
            }
        }
        return chains;
    }

    isValidCapture(player, midR, midC, endR, endC, boardInst) {
        const enemyPieces = player === 'AI' ? [1, 3] : [2, 4];
        return (
            this.isWithinBounds(midR, midC) &&
            this.isWithinBounds(endR, endC) &&
            enemyPieces.includes(boardInst.get(midR, midC)) &&
            boardInst.get(endR, endC) === 0
        );
    }

    findAllNonCaptureMoves(player, boardInst = this.board) {
        const ownPieces = player === 'AI' ? [2, 4] : [1, 3];
        const forwardDirs = player === 'AI' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
        const allDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardInst.get(r, c);
                if (ownPieces.includes(piece)) {
                    const isKing = (piece === 3 || piece === 4);
                    const dirs = isKing ? allDirs : forwardDirs;
                    for (const [dr, dc] of dirs) {
                        if (!isKing) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (this.isWithinBounds(nr, nc) && boardInst.get(nr, nc) === 0) {
                                moves.push([[r, c], [nr, nc]]);
                            }
                        } else {
                            let i = 1;
                            while (this.isWithinBounds(r + i * dr, c + i * dc)) {
                                const nr = r + i * dr;
                                const nc = c + i * dc;
                                if (boardInst.get(nr, nc) !== 0) break;
                                moves.push([[r, c], [nr, nc]]);
                                i++;
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }

    applyMoveChain(board, moveChain, player) {
        let [r, c] = moveChain[0];
        const piece = board.get(r, c);
        for (let i = 0; i < moveChain.length - 1; i++) {
            const [r1, c1] = moveChain[i];
            const [r2, c2] = moveChain[i + 1];
            const dr = Math.sign(r2 - r1);
            const dc = Math.sign(c2 - c1);
            let midR = r1 + dr;
            let midC = c1 + dc;
            while (midR !== r2 || midC !== c2) {
                if (board.get(midR, midC) !== 0) {
                    board.set(midR, midC, 0);
                    break;
                }
                midR += dr;
                midC += dc;
            }
            board.set(r1, c1, 0);
            board.set(r2, c2, piece);
            r = r2;
            c = c2;
        }
        board.promoteKings();
    }

    evaluate(board) {
        let aiScore = 0;
        let playerScore = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board.get(r, c);
                if (piece === 2) aiScore += 1;
                else if (piece === 4) aiScore += 1.5;
                else if (piece === 1) playerScore += 1;
                else if (piece === 3) playerScore += 1.5;
            }
        }
        return aiScore - playerScore;
    }

    isWithinBounds(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    getStrategicMove() {
        for (let r = 6; r >= 5; r--) {
            for (let c = 0; c < 8; c++) {
                if (this.board.get(r, c) === 2) {
                    for (const [dr, dc] of [[1, -1], [1, 1]]) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (this.isWithinBounds(nr, nc) && this.board.get(nr, nc) === 0) {
                            return [[r, c], [nr, nc]];
                        }
                    }
                }
            }
        }
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board.get(r, c);
                if (piece === 2) {
                    for (const [dr, dc] of [[1, -1], [1, 1]]) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (this.isWithinBounds(nr, nc) && this.board.get(nr, nc) === 0) {
                            return [[r, c], [nr, nc]];
                        }
                    }
                } else if (piece === 4) {
                    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
                        let i = 1;
                        while (this.isWithinBounds(r + i * dr, c + i * dc)) {
                            const nr = r + i * dr;
                            const nc = c + i * dc;
                            if (this.board.get(nr, nc) !== 0) break;
                            return [[r, c], [nr, nc]];
                        }
                    }
                }
            }
        }
        return null;
    }
}
//
// ----------------------
//  PLAYER LOGIC CLASS (Updated)
// ----------------------
class PlayerLogic {
    constructor(board) {
        this.board = board;
    }
    // For the player, enemy pieces are AI's (2 or 4)
    isEnemy(x) {
        return x === 2 || x === 4;
    }
    // Recursive capture search with board cloning.
    findMultiAttacks(r, c, visited = new Set(), boardInst = this.board) {
        const piece = boardInst.get(r, c);
        const isKing = piece === 3;
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        let out = [];
        for (let [dr, dc] of dirs) {
            if (!isKing) {
                const mr = r + dr, mc = c + dc;
                const er = r + 2 * dr, ec = c + 2 * dc;
                if (er < 0 || er >= boardInst.board.length || ec < 0 || ec >= boardInst.board[0].length) continue;
                if (this.isEnemy(boardInst.get(mr, mc)) && boardInst.get(er, ec) === 0) {
                    const key = `${er},${ec}`;
                    if (visited.has(key)) continue;
                    let newVisited = new Set(visited);
                    newVisited.add(key);
                    let cloned = boardInst.clone();
                    cloned.set(r, c, 0);
                    cloned.set(mr, mc, 0);
                    cloned.set(er, ec, piece);
                    let fut = this.findMultiAttacks(er, ec, newVisited, cloned);
                    if (fut.length) {
                        for (let chain of fut) {
                            out.push([[r, c], [er, ec], ...chain.slice(1)]);
                        }
                    } else {
                        out.push([[r, c], [er, ec]]);
                    }
                }
            } else {
                // Player kings: allow long diagonal moves.
                let i = 1;
                while (true) {
                    const mr = r + i * dr, mc = c + i * dc;
                    if (mr < 0 || mr >= boardInst.board.length || mc < 0 || mc >= boardInst.board[0].length) break;
                    if (boardInst.get(mr, mc) === 0) { i++; continue; }
                    if (!this.isEnemy(boardInst.get(mr, mc))) break;
                    let j = 1;
                    while (true) {
                        const er = mr + j * dr, ec = mc + j * dc;
                        if (er < 0 || er >= boardInst.board.length || ec < 0 || ec >= boardInst.board[0].length) break;
                        if (boardInst.get(er, ec) !== 0) break;
                        const key = `${er},${ec}`;
                        if (!visited.has(key)) {
                            let newVisited = new Set(visited);
                            newVisited.add(key);
                            let cloned = boardInst.clone();
                            cloned.set(r, c, 0);
                            cloned.set(mr, mc, 0);
                            cloned.set(er, ec, piece);
                            let fut = this.findMultiAttacks(er, ec, newVisited, cloned);
                            if (fut.length) {
                                for (let chain of fut) {
                                    out.push([[r, c], [er, ec], ...chain.slice(1)]);
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
    // Checks if there is any mandatory (capture) move for the player.
    hasMandatory() {
        for (let r = 0; r < this.board.board.length; r++) {
            for (let c = 0; c < this.board.board[r].length; c++) {
                const piece = this.board.get(r, c);
                if ((piece === 1 || piece === 3) && this.findMultiAttacks(r, c).length) {
                    return true;
                }
            }
        }
        return false;
    }
    // Given a start and end coordinate, return the appropriate move chain.
    getMoveChain(start, end) {
        // First try to find a capture chain.
        const chains = this.findMultiAttacks(...start);
        const chain = chains.find(ch => ch[1][0] === end[0] && ch[1][1] === end[1]);
        if (chain) return chain;
        // If no capture available and no mandatory capture exists, check for a simple slide move.
        if (!this.hasMandatory()) {
            const [r1, c1] = start;
            const [r2, c2] = end;
            const piece = this.board.get(r1, c1);
            if (this.board.get(r2, c2) !== 0) return null;
            if (piece === 1) {
                // Regular piece moves one forward diagonal (player moves upward)
                if (r2 === r1 - 1 && Math.abs(c2 - c1) === 1) {
                    return [[r1, c1], [r2, c2]];
                }
            } else if (piece === 3) {
                // King moves any distance diagonally provided the path is clear.
                const dr = r2 - r1;
                const dc = c2 - c1;
                if (Math.abs(dr) !== Math.abs(dc)) return null;
                const stepR = dr > 0 ? 1 : -1;
                const stepC = dc > 0 ? 1 : -1;
                for (let i = 1; i < Math.abs(dr); i++) {
                    if (this.board.get(r1 + i * stepR, c1 + i * stepC) !== 0) {
                        return null;
                    }
                }
                return [[r1, c1], [r2, c2]];
            }
        }
        return null;
    }
}

//
// ----------------------
//    UI LAYER (Canvas)
// ----------------------

const CANVAS_WIDTH = 1024, CANVAS_HEIGHT = 768;
const BOARD_X = 5, BOARD_Y = 20, BOARD_PIX = 580, TILE = BOARD_PIX / 8;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Load images (unchanged)
const images = {
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
    difficulty:       loadImg("./img/buttondifficulty_1.png"),
    difficulty_2:     loadImg("./img/buttondifficulty_2.png"),
    difficulty_3:     loadImg("./img/buttondifficulty.png"),
    your_turn:        loadImg("./img/Your turn.png"),
    dificulty_avatar: loadImg("./img/deda.png"),
    menu_button:      loadImg("./img/menu_button.png"),
    whitePiece:       loadImg("./img/whitePiece.png"),
    whitePieceKing:   loadImg("./img/whitePieceKing.png"),
    play_btn:         loadImg("./img/play_btn.png"),
    new_game_btn:     loadImg("./img/new_game_btn.png"),
    your_score_btn:   loadImg("./img/your_score_btn.png"),
    on_off_btn:       loadImg("./img/on_off_btn.png"),
    whiteFlag:        loadImg("./img/white-flag.png"),
    trophy:           loadImg("./img/trophy.png"),
    difficulty_img:   loadImg("./img/difficulty.png"),
    background_img:   loadImg("./img/background_img.png"),
    go_back_img:      loadImg("./img/go_back_img.png"),
    on_off_btn_on:    loadImg("./img/go_back_img.png"),
    volume_btn_img:   loadImg("./img/volume_btn_img.png"),
    music_btn_img:    loadImg("./img/music_btn.png"),
    sound_btn_img:    loadImg("./img/sound.png"),
    settings_background_img: loadImg("./img/settings_background_img.png"),
    background_rules_img: loadImg("./img/background_rules.png"),
    easy_diff_btn_img: loadImg("./img/easy_diff_btn.png"),
    medium_diff_btn_img: loadImg("./img/medium_diff_btn.png"),
    hard_diff_btn_img: loadImg("./img/hard_diff_btn.png"),
};
function loadImg(src) { let i = new Image(); i.src = src; return i; }

// Button and Piece classes (UI layer; unchanged)
class Button {
    constructor(x, y, w, h, text, scene, onClick = null, img = null, fs = 40, c = "#4CAF50", tc = "white") {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.scene = scene;
        this.onClick = onClick;
        // Check if img is a function or a static image
        if (typeof img === 'function') {
            this.imgFunc = img; // Store the function
        } else {
            this.img = img; // Store the static image
        }
        this.fs = fs;
        this.c = c;
        this.tc = tc;
    }
    draw() {
        if (currentScene !== this.scene) return;
        ctx.save();
        let imageToDraw;
        // If imgFunc exists, call it to get the current image; otherwise, use static img
        if (this.imgFunc) {
            imageToDraw = this.imgFunc();
        } else {
            imageToDraw = this.img;
        }
        if (imageToDraw) {
            ctx.drawImage(imageToDraw, this.x, this.y, this.w, this.h);
        } else {
            // Default drawing for buttons without an image
            ctx.fillStyle = this.c;
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.w, this.h, this.h / 2);
            ctx.fill();
            ctx.textAlign = "center";
            ctx.font = `bold ${this.fs}px Impact, Arial Black, Comic Sans MS`;
            ctx.fillStyle = this.tc;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 6;
            ctx.translate(this.x + this.w / 2, this.y + this.h / 1.5);
            ctx.scale(1.15, 1);
            ctx.strokeText(this.text, 0, 0);
            ctx.fillText(this.text, 0, 0);
        }
        ctx.restore();
    }
    isClicked(mx, my) {
        return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
    }
}

class Piece {
    constructor(row, col, type, img) {
        Object.assign(this, { row, col, type, img });
        this.selected = false;
        this.isMoving = false;
        this.moveProgress = 0;
        this.startRow = 0;
        this.startCol = 0;
        this.targetRow = 0;
        this.targetCol = 0;
    }
    draw() {
        if (currentScene !== "game") return;
        let x, y;
        if (this.isMoving) {
            let sx = BOARD_X + this.startCol * TILE,
                sy = BOARD_Y + this.startRow * TILE,
                ex = BOARD_X + this.targetCol * TILE,
                ey = BOARD_Y + this.targetRow * TILE;
            x = sx + (ex - sx) * this.moveProgress;
            y = sy + (ey - sy) * this.moveProgress;
        } else {
            x = BOARD_X + this.col * TILE;
            y = BOARD_Y + this.row * TILE;
        }
        let p = 5;
        ctx.drawImage(this.img, x + p, y + p, TILE - 2 * p, TILE - 2 * p);
        if (this.selected) {
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, TILE, TILE);
        }
    }
    startMove(toRow, toCol) {
        this.startRow = this.row;
        this.startCol = this.col;
        this.targetRow = toRow;
        this.targetCol = toCol;
        this.isMoving = true;
        this.moveProgress = 0;
    }
    update(dt) {
        if (!this.isMoving) return;
        this.moveProgress += dt / 500;
        if (this.moveProgress >= 1) {
            this.moveProgress = 1;
            this.isMoving = false;
            this.row = this.targetRow;
            this.col = this.targetCol;
        }
    }
    isClicked(mx, my) {
        let x = BOARD_X + this.col * TILE,
            y = BOARD_Y + this.row * TILE;
        return mx >= x && mx < x + TILE && my >= y && my < y + TILE;
    }
    select() {
        pieces.forEach(p => p.selected = false);
        this.selected = true;
    }
}

// Game state variables.
let currentScene = "menu";
let previousScene = currentScene;
let boardLogic = new Board();
let aiLogic = new AI(boardLogic);
let plLogic = new PlayerLogic(boardLogic);
let pieces = [];
let selectedPiece = null;

// Animation queue and flags.
let animQueue = [], animating = false, currentAnim = null, waitingForCompletion = false;

// This function queues up animations based on a chain (an array of moves)
function enqueueAnimation(chain, value) {
    // chain = [[r,c], ...]
    animQueue = [];
    for (let i = 0; i < chain.length - 1; i++) {
        let [r1, c1] = chain[i],
            [r2, c2] = chain[i + 1];
        let cap = null;
        const dr = r2 - r1;
        const dc = c2 - c1;
        if (Math.abs(dr) === 2) {
            // Normal capture (jump over adjacent enemy)
            cap = [ (r1 + r2) >> 1, (c1 + c2) >> 1 ];
        } else if (Math.abs(dr) > 2) {
            // King capture: scan along diagonal for first non-empty square.
            const stepR = dr > 0 ? 1 : -1;
            const stepC = dc > 0 ? 1 : -1;
            for (let j = 1; j < Math.abs(dr); j++) {
                let midR = r1 + j * stepR,
                    midC = c1 + j * stepC;
                if (boardLogic.get(midR, midC) !== 0) {
                    cap = [midR, midC];
                    break;
                }
            }
        }
        animQueue.push({ from: [r1, c1], to: [r2, c2], capture: cap, value });
    }
    animating = true;
    runNextAnim();
}

function runNextAnim() {
    if (animQueue.length === 0) {
        currentAnim = null;
        animating = false;
        // If last move was player's move (value 1), trigger AI turn.
        if (currentAnimValue === 1) {
            const chain = aiLogic.getMoveChain();
            if (chain) enqueueAnimation(chain, 2);
        }
        return;
    }
    currentAnim = animQueue.shift();
    currentAnimValue = currentAnim.value;
    const [r, c] = currentAnim.from;
    const p = pieces.find(x => x.row === r && x.col === c);
    if (!p) { runNextAnim(); return; }
    p.startMove(...currentAnim.to);
    waitingForCompletion = true;
}

function completeCurrentAnim() {
    const { from, to, capture, value } = currentAnim;
    // Remove piece from the starting square.
    const myVal = boardLogic.get(...from);
    boardLogic.set(...from, 0);
    let newVal = myVal;
    // Decide on promotion if reached an end.
    if (value === 2 && to[0] === 7) newVal = 4;
    if (value === 1 && to[0] === 0) newVal = 3;
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
    boardLogic.set(...to, newVal);
    // Clear captured piece if any.
    if (capture) boardLogic.set(...capture, 0);
    // Remove captured piece from UI.
    if (capture) {
        pieces = pieces.filter(p => !(p.row === capture[0] && p.col === capture[1]));
    }
    waitingForCompletion = false;
    runNextAnim();
}

function syncPieces() {
    // Sync the UI pieces array with boardLogic state.
    pieces = [];
    for (let r = 0; r < boardLogic.board.length; r++) {
        for (let c = 0; c < boardLogic.board[r].length; c++) {
            let v = boardLogic.get(r, c);
            if (v === 1) pieces.push(new Piece(r, c, "white", images.whitePiece));
            if (v === 2) pieces.push(new Piece(r, c, "black", images.blackPiece));
            if (v === 3) pieces.push(new Piece(r, c, "whiteKing", images.whitePieceKing));
            if (v === 4) pieces.push(new Piece(r, c, "blackKing", images.blackPieceKing));
        }
    }
}

//GLOBAL MENU UI STATE SETTINGS
let volumeOn = false;
let soundOn = false;
let musicOn = false;

//additional buttons/vars/supplies
//sound and music
// полный путь к вашему mp3 (относительный или абсолютный URL)
const bgMusic = new Audio("./audio/background_music.mp3");
bgMusic.loop = true;

const getDifficultyImage = () => {
    switch (difficulty) {
        case 1: return images.difficulty;
        case 2: return images.difficulty_2;
        case 3: return images.difficulty_3;
        default: return images.difficulty; // Fallback
    }
};

// Buttons (same as before) // not really buttons..EVERYTHING IS A BUTTON! Just some of them are clickable, others - not.
const buttons = [
    new Button(55, 80, 920, 570, "sound_btn_img", "settings", null , images.settings_background_img),
    new Button(55, 80, 920, 570, "background_rules", "qa", null , images.background_rules_img),
    new Button(344, 616-48, 370, 80, "go back", "qa", () => switchScene("menu"), images.go_back_img),

    new Button(0, 0, canvas.width, canvas.height, "background_img", "menu", null, images.background_img),
    new Button(344, 616, 370, 80, "go back", "settings", () => switchScene("menu"), images.go_back_img),
    new Button(444-125, 444-125-125, 100, 100, "volume_btn_img", "settings", null , images.volume_btn_img),
    new Button(444-125, 444-125, 100, 100, "music_btn_img", "settings", null , images.music_btn_img),
    new Button(444-125, 444, 100, 100, "sound_btn_img", "settings", null , images.sound_btn_img),

    new Button(canvas.width / 2 - 125, 20, 250, 250, "Flag", "menu", () => switchScene("game"), images.logo),
    new Button(20, 20, 90, 90, "Settings", "menu", () => switchScene("settings"), images.settings),
    new Button(canvas.width - 110, 20, 90, 90, "Profile", "menu", () => switchScene("profile"), images.profile),
    new Button(canvas.width - 110, canvas.height - 110, 90, 90, "QA", "menu", () => switchScene("qa"), images.qa),
    new Button(canvas.width / 2 - 150, canvas.height / 2, 300, 70, "Play", "menu", () => {
        switchScene("game");
        // boardLogic = new Board();
        // aiLogic = new AI(boardLogic);
        // plLogic = new PlayerLogic(boardLogic);
        // syncPieces();
    }, images.play_btn, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 92, 300, 70, "New Game", "menu", () => {
        boardLogic = new Board();
        aiLogic = new AI(boardLogic);
        plLogic = new PlayerLogic(boardLogic);
        syncPieces();
        switchScene("game");
    }, images.new_game_btn, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width / 2 - 150, canvas.height / 2 + 184, 300, 70, "Your Score", "menu", () => switchScene("score"), images.your_score_btn, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width - 170, 20, 150, 150, "Flag", "game", () => switchScene("menu"), images.logo),
    new Button(
        canvas.width / 2 + 150,
        270,
        350,
        100,
        "Difficulty",
        "game",
        () => switchScene("difficulty_scene"), // Simplified onClick
        getDifficultyImage // Pass the function, not its result
    ),
    new Button(canvas.width / 2 - 150, canvas.height - 88, 300, 70, "Difficulty", "menu", () => switchScene("difficulty_scene"), images.difficulty_img),
    new Button(340+330, canvas.height - 100, 220, 70, "Difficulty", "game", () => switchScene("difficulty_scene"), images.difficulty_img),


    new Button(10, canvas.height - 100, 300, 70, "Menu", "game", () => switchScene("menu"), images.menu_button, 40, "#A6BFDB", "#6A8CBB"),
    new Button(340, canvas.height - 100, 300, 70, "New Game", "game", () => {
        boardLogic = new Board();
        aiLogic = new AI(boardLogic);
        plLogic = new PlayerLogic(boardLogic);
        syncPieces();
    }, images.new_game_button, 40, "#A6BFDB", "#6A8CBB"),
    new Button(canvas.width - 110, canvas.height - 110, 90, 90, "QA", "game", () => switchScene("qa"), images.qa),

    (() => {
        // локальное состояние кнопки

        // создаём кнопку, колбэк — обычная function, чтобы this = btn
        const btn = new Button(
            444,
            444-125-125,
            270, 100,
            "on_volume_setting",
            "settings",
            function() {
                // this здесь = btn
                volumeOn = !volumeOn;
                this.img = volumeOn
                    ? images.on_off_btn_on
                    : images.on_off_btn;
                if (volumeOn) {
                    // начинаем музыку
                    bgMusic.play().catch(err => {
                        // в браузерах без юзер-инициированного события
                        console.warn("Не удалось запустить музыку:", err);
                    });
                } else {
                    // ставим на паузу
                    bgMusic.pause();
                }
            },
            images.on_off_btn  // начальная картинка
        );



        return btn;
    })(),
    (() => {
        // локальное состояние кнопки

        // создаём кнопку, колбэк — обычная function, чтобы this = btn
        const btn = new Button(
            444,
            444-125,
            270, 100,
            "on_sound_setting",
            "settings",
            function() {
                // this здесь = btn
                soundOn = !soundOn;
                this.img = soundOn
                    ? images.on_off_btn_on
                    : images.on_off_btn;
            },
            images.on_off_btn  // начальная картинка
        );

        return btn;
    })(),
    (() => {
        // локальное состояние кнопки

        // создаём кнопку, колбэк — обычная function, чтобы this = btn
        const btn = new Button(
            444,
            444,
            270, 100,
            "on_music_setting",
            "settings",
            function() {
                // this здесь = btn
                musicOn = !musicOn;
                this.img = musicOn
                    ? images.on_off_btn_on
                    : images.on_off_btn;
            },
            images.on_off_btn  // начальная картинка
        );

        return btn;
    })(),


    new Button(260, 600, 400, 80, "Go Back", "score", () => {
        switchScene("menu");
    }, null, 50, "#C1DFFB", "#99B9D7"),

    new Button(300, 350, 400, 70, "easy_difficulty", "difficulty_scene", () => {
        switchScene(previousScene);
        difficulty = 1;
    } , images.easy_diff_btn_img),
    new Button(300, 350+92, 400, 70, "medium_difficulty", "difficulty_scene", () => {
        switchScene(previousScene);
        difficulty = 2;
    } , images.medium_diff_btn_img),
    new Button(300, 350+92+92, 400, 70, "hard_difficulty", "difficulty_scene", () => {
        switchScene(previousScene);
        difficulty = 3;
    } , images.hard_diff_btn_img),

];

function switchScene(s) {
    previousScene = currentScene;
    currentScene = s;
}

// Draw helpers
function drawBoard() { ctx.drawImage(images.board, BOARD_X, BOARD_Y, BOARD_PIX, BOARD_PIX); }
function drawProgress() {
    const x = canvas.width / 2 + 320, y = 460, w = 350, h = 80, br = h / 2, pad = 6, p = 0.49;
    ctx.save();
    ctx.fillStyle = "white";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y, w, h, br);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#C8D093";
    ctx.beginPath();
    ctx.roundRect(x - w / 2 + pad, y + pad, (w - pad * 2) * p, h - pad * 2, (h - pad * 2) / 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "30px Comic Sans MS";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(p * 100) + "%", x, y + h / 2);
}

// Main game loop
let last = 0;
function gameLoop(ts) {
    const dt = ts - last;
    last = ts;
    pieces.forEach(p => p.update(dt));
    if (waitingForCompletion && currentAnim) {
        let mp = pieces.find(p => p.row === currentAnim.to[0] && p.col === currentAnim.to[1] && !p.isMoving);
        if (mp) completeCurrentAnim();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    buttons.forEach(b => b.draw());
    if (currentScene === "menu") {
        ctx.drawImage(images.naming, canvas.width / 2 - 350, 270, 700, 100);
    } else if (currentScene === "game") {
        drawBoard();
        pieces.forEach(p => p.draw());
        ctx.drawImage(images.naming, canvas.width / 2 + 100, 70, 220, 40);
        ctx.drawImage(images.your_turn, canvas.width / 2 + 220, 400, 200, 50);
        ctx.drawImage(images.dificulty_avatar, canvas.width / 2 + 150, 220, 90, 150);
        drawProgress();
    } else if (currentScene === "settings") {
        //drawBoard();
    } else if (currentScene === "score") {
        // Score scene drawing (as before)
        ctx.fillStyle = "#C9DEF2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#78A3CB";
        ctx.lineWidth = 8;
        ctx.font = "bold 80px Caprasimo, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SCORE", canvas.width / 2, 60);
        ctx.strokeText("SCORE", canvas.width / 2, 60);
        ctx.fillStyle = "#EDEDED";
        ctx.strokeStyle = "#A7AEB6";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.roundRect(50, 100, 400, 400, 30);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#78A3CB";
        ctx.lineWidth = 5;
        ctx.font = "bold 40px Caprasimo, Arial";
        ctx.fillText("Your Statistics", 250, 150);
        ctx.strokeText("Your Statistics", 250, 150);
        const history = [
            { text: "Loser!", color: "#EDBEBE", y: 220, icon: images.whiteFlag },
            { text: "Winner!", color: "#ECF9A6", y: 280, icon: images.trophy },
            { text: "Loser!", color: "#EDBEBE", y: 340, icon: images.whiteFlag },
            { text: "Winner!", color: "#ECF9A6", y: 400, icon: images.trophy },
        ];
        history.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.roundRect(80, item.y, 340, 50, 10);
            ctx.fill();
            ctx.fillStyle = item.text === "Winner!" ? "#8F8D7D" : "#FFFFFF";
            ctx.strokeStyle = item.text === "Winner!" ? "#FFFFFF" : "#9E9E9E";
            ctx.lineWidth = 3;
            ctx.font = "bold 32px Caprasimo, Arial";
            ctx.fillText(item.text, 250, item.y + 25);
            ctx.strokeText(item.text, 250, item.y + 25);
            if (item.icon) {
                ctx.drawImage(item.icon, 60, item.y + 5, 40, 40);
            }
        });
        ctx.fillStyle = "#FBFBFB";
        ctx.beginPath();
        ctx.roundRect(460, 200, 20, 240, 20);
        ctx.fill();
        ctx.fillStyle = "#D6D6D6";
        ctx.beginPath();
        ctx.roundRect(460, 200, 20, 80, 20);
        ctx.fill();
        ctx.fillStyle = "#EDEDED";
        ctx.strokeStyle = "#A7AEB6";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.roundRect(520, 100, 400, 400, 30);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#78A3CB";
        ctx.lineWidth = 5;
        ctx.font = "bold 40px Caprasimo, Arial";
        ctx.fillText("Total wins", 720, 150);
        ctx.strokeText("Total wins", 720, 150);
        const wins = [
            { text: "Hard 10", color: "#E39E9E", border: "#BE7272", y: 220 },
            { text: "Medium 25", color: "#99B9D7", border: "#547CA1", y: 300 },
            { text: "Easy 30", color: "#C6D08B", border: "#92986E", y: 380 },
        ];
        wins.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.roundRect(560, item.y, 260, 70, 20);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = item.border;
            ctx.lineWidth = 4;
            ctx.font = "bold 28px Caprasimo, Arial";
            ctx.fillText(item.text, 690, item.y + 35);
            ctx.strokeText(item.text, 690, item.y + 35);
            ctx.drawImage(images.trophy, 860, item.y + 15, 40, 40);
        });
    } else if (currentScene === "QA"){
        // ---
    }
    requestAnimationFrame(gameLoop);
}

// Input handling: click events.
canvas.addEventListener("click", e => {
    if (animating) return; // ignore clicks during animation
    let rct = canvas.getBoundingClientRect();
    let mx = e.clientX - rct.left, my = e.clientY - rct.top;

    let cx = mx - BOARD_X;// + this.col * TILE,
    let cy = my - BOARD_Y;// + this.row * TILE;
    boardLogic.clicked(Math.floor(cy/TILE), Math.floor(cx/TILE)); // here you clicked



    // Check buttons first.
    for (let b of buttons) {
        if (b.scene === currentScene && b.isClicked(mx, my) && b.onClick) {
            b.onClick();
            return;
        }
    }
    if (currentScene === "game") {
        const rct = canvas.getBoundingClientRect();
        const mx  = e.clientX - rct.left;
        const my  = e.clientY - rct.top;

        const row = Math.floor((my - BOARD_Y) / TILE);
        const col = Math.floor((mx - BOARD_X) / TILE);

        boardLogic.clicked(row, col);
    }
});

// Start-up: load all images and start the game loop.
Promise.all(Object.values(images).map(img => new Promise(r => img.onload = r)))
    .then(() => {
        syncPieces();
        requestAnimationFrame(gameLoop);
    });
