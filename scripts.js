document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('chessBoard');
    const pieces = [
        'rook black', 'knight black', 'bishop black', 'queen black', 'king black', 'bishop black', 'knight black', 'rook black',
        'pawn black', 'pawn black', 'pawn black', 'pawn black', 'pawn black', 'pawn black', 'pawn black', 'pawn black',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'pawn white', 'pawn white', 'pawn white', 'pawn white', 'pawn white', 'pawn white', 'pawn white', 'pawn white',
        'rook white', 'knight white', 'bishop white', 'queen white', 'king white', 'bishop white', 'knight white', 'rook white'
    ];

    const createSquare = (color, piece = '', id) => {
        const square = document.createElement('div');
        square.classList.add('square', color);
        square.id = `square-${id}`;
        if (piece) {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece', piece);
            pieceElement.innerHTML = getPieceUnicode(piece);
            square.appendChild(pieceElement);
        }
        return square;
    };

    const getPieceUnicode = (piece) => {
        const pieceMap = {
            'pawn white': '♙', 'rook white': '♖', 'knight white': '♘', 'bishop white': '♗', 'queen white': '♕', 'king white': '♔',
            'pawn black': '♟', 'rook black': '♜', 'knight black': '♞', 'bishop black': '♝', 'queen black': '♛', 'king black': '♚'
        };
        return pieceMap[piece] || '';
    };

    for (let i = 0; i < 64; i++) {
        const color = (Math.floor(i / 8) + i) % 2 === 0 ? 'white' : 'black';
        board.appendChild(createSquare(color, pieces[i], i));
    }

    let currentPlayer = 'white';
    const piecesElements = document.querySelectorAll('.piece');
    piecesElements.forEach(piece => {
        piece.draggable = true;
        piece.addEventListener('dragstart', (e) => {
            if (currentPlayer === getPieceColor(e.target.className)) {
                e.dataTransfer.setData('text/plain', e.target.parentElement.id);
                highlightMoves(e.target);
            } else {
                e.preventDefault();
            }
        });
    });

    const squaresElements = document.querySelectorAll('.square');
    squaresElements.forEach(square => {
        square.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        square.addEventListener('drop', (e) => {
            const sourceId = e.dataTransfer.getData('text/plain');
            const sourceSquare = document.getElementById(sourceId);
            if (isValidMove(sourceSquare, e.target)) {
                if (e.target.firstElementChild) {
                    handleCapture(e.target.firstElementChild);
                }
                e.target.appendChild(sourceSquare.firstElementChild);
                clearHighlights();
                checkForSpecialMoves(sourceSquare, e.target);
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                checkForCheckmate();
            }
        });
    });

    const getPieceColor = (pieceClass) => {
        return pieceClass.includes('black') ? 'black' : 'white';
    };

    const isValidMove = (source, target) => {
        const sourceIndex = parseInt(source.id.split('-')[1]);
        const targetIndex = parseInt(target.id.split('-')[1]);
        const pieceClass = source.firstElementChild.className.split(' ');
        const pieceType = pieceClass[0];
        const pieceColor = pieceClass[1];
        const direction = pieceColor === 'white' ? -1 : 1;
        const rowDifference = Math.floor(targetIndex / 8) - Math.floor(sourceIndex / 8);
        const colDifference = (targetIndex % 8) - (sourceIndex % 8);
        const absRowDifference = Math.abs(rowDifference);
        const absColDifference = Math.abs(colDifference);

        if (pieceType === 'pawn') {
            if (colDifference === 0 && !target.firstElementChild) {
                if (rowDifference === direction) return true;
                if ((rowDifference === 2 * direction) && (Math.floor(sourceIndex / 8) === (pieceColor === 'white' ? 6 : 1))) return true;
            }
            if (absColDifference === 1 && rowDifference === direction && target.firstElementChild) return true;
        }

        if (pieceType === 'rook') {
            if (absRowDifference === 0 || absColDifference === 0) return !isPathBlocked(sourceIndex, targetIndex);
        }

        if (pieceType === 'knight') {
            if ((absRowDifference === 2 && absColDifference === 1) || (absRowDifference === 1 && absColDifference === 2)) return true;
        }

        if (pieceType === 'bishop') {
            if (absRowDifference === absColDifference) return !isPathBlocked(sourceIndex, targetIndex);
        }

        if (pieceType === 'queen') {
            if (absRowDifference === absColDifference || absRowDifference === 0 || absColDifference === 0) return !isPathBlocked(sourceIndex, targetIndex);
        }

        if (pieceType === 'king') {
            if (absRowDifference <= 1 && absColDifference <= 1) return true;
        }

        return false;
    };

    const isPathBlocked = (sourceIndex, targetIndex) => {
        const direction = Math.sign(targetIndex - sourceIndex);
        const increment = (Math.abs(targetIndex - sourceIndex) % 9 === 0 || Math.abs(targetIndex - sourceIndex) % 7 === 0) ? 9 : (Math.abs(targetIndex - sourceIndex) % 8 === 0) ? 8 : 1;
        for (let i = sourceIndex + direction * increment; i !== targetIndex; i += direction * increment) {
            if (document.getElementById(`square-${i}`).firstElementChild) return true;
        }
        return false;
    };

    const highlightMoves = (piece) => {
        const sourceIndex = parseInt(piece.parentElement.id.split('-')[1]);
        const pieceClass = piece.className.split(' ');
        const pieceType = pieceClass[0];
        const pieceColor = pieceClass[1];
        const possibleMoves = calculatePossibleMoves(sourceIndex, pieceType, pieceColor);
        possibleMoves.forEach(move => {
            const targetSquare = document.getElementById(`square-${move}`);
            targetSquare.classList.add('highlight');
        });
    };

    const calculatePossibleMoves = (index, pieceType, pieceColor) => {
        const possibleMoves = [];
        const direction = pieceColor === 'white' ? -1 : 1;

        if (pieceType === 'pawn') {
            const oneStep = index + 8 * direction;
            const twoSteps = index + 16 * direction;
            if (!document.getElementById(`square-${oneStep}`).firstElementChild) possibleMoves.push(oneStep);
            if ((Math.floor(index / 8) === (pieceColor === 'white' ? 6 : 1)) && !document.getElementById(`square-${twoSteps}`).firstElementChild) possibleMoves.push(twoSteps);

            const captureLeft = index + 7 * direction;
            const captureRight = index + 9 * direction;
            if (document.getElementById(`square-${captureLeft}`) && document.getElementById(`square-${captureLeft}`).firstElementChild && getPieceColor(document.getElementById(`square-${captureLeft}`).firstElementChild.className) !== pieceColor) possibleMoves.push(captureLeft);
            if (document.getElementById(`square-${captureRight}`) && document.getElementById(`square-${captureRight}`).firstElementChild && getPieceColor(document.getElementById(`square-${captureRight}`).firstElementChild.className) !== pieceColor) possibleMoves.push(captureRight);
        }

        if (pieceType === 'rook' || pieceType === 'queen') {
            for (let i = index - 8; i >= 0; i -= 8) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
            for (let i = index + 8; i < 64; i += 8) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
            for (let i = index - 1; i % 8 !== 7 && i >= 0; i--) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
            for (let i = index + 1; i % 8 !== 0 && i < 64; i++) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
        }

        if (pieceType === 'bishop' || pieceType === 'queen') {
            for (let i = index - 9; i >= 0 && i % 8 !== 7; i -= 9) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
            for (let i = index - 7; i >= 0 && i % 8 !== 0; i -= 7) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
            for (let i = index + 9; i < 64 && i % 8 !== 0; i += 9) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
            for (let i = index + 7; i < 64 && i % 8 !== 7; i += 7) {
                if (document.getElementById(`square-${i}`).firstElementChild) {
                    if (getPieceColor(document.getElementById(`square-${i}`).firstElementChild.className) !== pieceColor) possibleMoves.push(i);
                    break;
                }
                possibleMoves.push(i);
            }
        }

        if (pieceType === 'knight') {
            const knightMoves = [-17, -15, -10, -6, 6, 10, 15, 17];
            knightMoves.forEach(move => {
                const targetIndex = index + move;
                if (targetIndex >= 0 && targetIndex < 64 && Math.abs(Math.floor(targetIndex / 8) - Math.floor(index / 8)) <= 2) {
                    if (!document.getElementById(`square-${targetIndex}`).firstElementChild || getPieceColor(document.getElementById(`square-${targetIndex}`).firstElementChild.className) !== pieceColor) possibleMoves.push(targetIndex);
                }
            });
        }

        if (pieceType === 'king') {
            const kingMoves = [-9, -8, -7, -1, 1, 7, 8, 9];
            kingMoves.forEach(move => {
                const targetIndex = index + move;
                if (targetIndex >= 0 && targetIndex < 64 && Math.abs(Math.floor(targetIndex / 8) - Math.floor(index / 8)) <= 1) {
                    if (!document.getElementById(`square-${targetIndex}`).firstElementChild || getPieceColor(document.getElementById(`square-${targetIndex}`).firstElementChild.className) !== pieceColor) possibleMoves.push(targetIndex);
                }
            });
        }

        return possibleMoves;
    };

    const clearHighlights = () => {
        const highlightedSquares = document.querySelectorAll('.square.highlight');
        highlightedSquares.forEach(square => {
            square.classList.remove('highlight');
        });
    };

    const handleCapture = (piece) => {
        const capturedPiecesContainer = document.getElementById('capturedPieces');
        capturedPiecesContainer.appendChild(piece);
    };

    const checkForSpecialMoves = (source, target) => {
        const piece = source.firstElementChild.className.split(' ')[0];
        if (piece === 'pawn' && (Math.floor(target.id.split('-')[1] / 8) === 0 || Math.floor(target.id.split('-')[1] / 8) === 7)) {
            target.firstElementChild.innerHTML = getPieceUnicode(`queen ${getPieceColor(source.firstElementChild.className)}`);
            target.firstElementChild.className = `piece queen ${getPieceColor(source.firstElementChild.className)}`;
        }
    };

    const checkForCheckmate = () => {
    };
});
