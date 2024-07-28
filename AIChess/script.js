var board = null;
var game = new Chess();
var depth = 3;
var $status = $('#status');
var $fen = $('#fen');
var $pgn = $('#pgn');

function onDragStart(source, piece, position, orientation) {
    if (game.in_checkmate() || game.in_draw() || piece.search(/^b/) !== -1) {
        return false;
    }
}

function makeBestMove() {
    var bestMove = getBestMove(game);
    game.move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
    updateStatus();
    if (game.game_over()) {
        alert('Game over');
    }
}

function getBestMove(game) {
    if (game.game_over()) {
        alert('Game over');
    }
    var depth = parseInt(document.getElementById('depth').value);
    var bestMove = minimaxRoot(depth, game, true);
    return bestMove;
}

function renderMoveHistory(moves) {
    var historyElement = document.getElementById('move-history').getElementsByTagName('tbody')[0];
    historyElement.innerHTML = '';
    for (var i = 0; i < moves.length; i += 2) {
        var row = document.createElement('tr');
        var whiteCell = document.createElement('td');
        whiteCell.textContent = moves[i];
        var blackCell = document.createElement('td');
        blackCell.textContent = moves[i + 1] ? moves[i + 1] : ' ';
        row.appendChild(whiteCell);
        row.appendChild(blackCell);
        historyElement.appendChild(row);
    }
    historyElement.scrollTop = historyElement.scrollHeight;
}

var onDrop = function(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });
    if (move === null) return 'snapback';
    renderMoveHistory(game.history());
    window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function() {
    board.position(game.fen());
};

var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};

board = Chessboard('board', cfg);

document.getElementById('startBtn').addEventListener('click', function() {
    game.reset();
    board.start();
    document.getElementById('move-history').getElementsByTagName('tbody')[0].innerHTML = '';
    updateStatus();
});

document.getElementById('undoBtn').addEventListener('click', function() {
    game.undo();
    board.position(game.fen());
    renderMoveHistory(game.history());
    updateStatus();
});

document.getElementById('aiMoveBtn').addEventListener('click', function() {
    makeBestMove();
    updateStatus();
});

document.getElementById('resetBtn').addEventListener('click', function() {
    game.reset();
    board.start();
    document.getElementById('move-history').getElementsByTagName('tbody')[0].innerHTML = '';
    updateStatus();
});

document.getElementById('theme').addEventListener('change', function() {
    document.body.className = this.value;
});

function minimaxRoot(depth, game, isMaximizingPlayer) {
    var newGameMoves = game.ugly_moves();
    var bestMove = -9999;
    var bestMoveFound;

    for (var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i];
        game.ugly_move(newGameMove);
        var value = minimax(depth - 1, game, -10000, 10000, !isMaximizingPlayer);
        game.undo();
        if (value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    return bestMoveFound;
}

function minimax(depth, game, alpha, beta, isMaximizingPlayer) {
    if (depth === 0) {
        return -evaluateBoard(game.board());
    }
    var newGameMoves = game.ugly_moves();
    if (isMaximizingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximizingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximizingPlayer));
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
}

function evaluateBoard(board) {
    var totalEvaluation = 0;
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            totalEvaluation += getPieceValue(board[row][col]);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function(piece, isWhite) {
        if (piece.type === 'p') {
            return 10;
        } else if (piece.type === 'r') {
            return 50;
        } else if (piece.type === 'n') {
            return 30;
        } else if (piece.type === 'b') {
            return 30;
        } else if (piece.type === 'q') {
            return 90;
        } else if (piece.type === 'k') {
            return 900;
        }
    };
    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w');
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
}

function updateStatus() {
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
        moveColor = 'Black';
    }

    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = moveColor + ' to move';

        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check';
        }
    }

    $status.html(status);
    $fen.html(game.fen());
    $pgn.html(game.pgn());
}

updateStatus();
