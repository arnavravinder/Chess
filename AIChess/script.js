var board = null;
var game = new Chess();

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
    if (game.game_over()) {
        alert('Game over');
    }
}

function getBestMove(game) {
    if (game.game_over()) {
        alert('Game over');
    }
    var depth = 3;
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
});

document.getElementById('undoBtn').addEventListener('click', function() {
    game.undo();
    board.position(game.fen());
    renderMoveHistory(game.history());
});

function minimaxRoot(depth, game, isMaximizingPlayer) {
    var newGameMoves = game.ugly_moves();
    var bestMve = -9999;

