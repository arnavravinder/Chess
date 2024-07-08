document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessBoard');
    const squares = 64;
    const pieces = [
        'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook',
        'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn',
        'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
    ];
    const createSquare = (color, piece = '') => {
        const square = document.createElement('div');
        square.classList.add('square', color);
        if (piece) {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece', piece);
            square.appendChild(pieceElement);
        }
        return square;
    };

    for (let i = 0; i < squares; i++) {
        const color = (Math.floor(i / 8) + i) % 2 === 0 ? 'white' : 'black';
        board.appendChild(createSquare(color, pieces[i]));
    }

    // Add basic movement logic
    const piecesElements = document.querySelectorAll('.piece');
    piecesElements.forEach(piece => {
        piece.draggable = true;
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.className);
        });
    });

    const squaresElements = document.querySelectorAll('.square');
    squaresElements.forEach(square => {
        square.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        square.addEventListener('drop', (e) => {
            const pieceClass = e.dataTransfer.getData('text/plain');
            const pieceElement = document.querySelector(`.${pieceClass}`);
            if (pieceElement) {
                square.appendChild(pieceElement);
            }
        });
    });
});
