// Gameboard module
const Gameboard = (function() {
    let board = ["", "", "", "", "", "", "", "", ""];
    
    function getBoard() {
        return [...board]; // Return a copy to prevent direct manipulation
    }
    
    function updateBoard(index, marker) {
        if (index >= 0 && index < 9 && board[index] === "") {
            board[index] = marker;
            return true;
        }
        return false;
    }
    
    function resetBoard() {
        board = ["", "", "", "", "", "", "", "", ""];
    }
    
    return { getBoard, updateBoard, resetBoard };
})();

// Player factory function
function Player(name, marker) {
    return { name, marker };
}

// Toast notification function
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Game controller module
const GameController = (function() {
    let player1;
    let player2;
    let currentPlayer;
    let gameOver = false;
    let player1Wins = 0;
    let player2Wins = 0;
    let draws = 0;
    let winningCells = [];
    
    function initializePlayers(player1Name, player2Name) {
        player1 = Player(player1Name || "Player X", "X");
        player2 = Player(player2Name || "Player O", "O");
        currentPlayer = player1;
        
        document.getElementById("player1-name").textContent = player1.name;
        document.getElementById("player2-name").textContent = player2.name;
        
        updateScoreboard();
        updateActivePlayer();
    }
    
    function updateScoreboard() {
        document.getElementById("player1-wins").textContent = player1Wins;
        document.getElementById("player2-wins").textContent = player2Wins;
        document.getElementById("draws").textContent = draws;
    }
    
    function updateActivePlayer() {
        document.getElementById("player1-score").classList.remove("active");
        document.getElementById("player2-score").classList.remove("active");
        
        if (currentPlayer === player1) {
            document.getElementById("player1-score").classList.add("active");
        } else {
            document.getElementById("player2-score").classList.add("active");
        }
    }
    
    function switchTurn() {
        currentPlayer = (currentPlayer === player1) ? player2 : player1;
        updateActivePlayer();
    }
    
    function checkWinner() {
        const board = Gameboard.getBoard();
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                winningCells = combo; // Store winning cells for animation
                return board[a]; // Return "X" or "O"
            }
        }
        
        if (!board.includes("")) {
            return "draw"; // If no empty spaces, it's a draw
        }
        
        return null; // No winner yet
    }
    
    function highlightWinningCells() {
        const cells = document.querySelectorAll('.cell');
        winningCells.forEach(index => {
            cells[index].classList.add('winner-animation');
        });
    }
    
    function playTurn(index) {
        if (gameOver || Gameboard.getBoard()[index] !== "") return;
        
        Gameboard.updateBoard(index, currentPlayer.marker);
        
        // Add animation class to the cell
        const cells = document.querySelectorAll('.cell');
        cells[index].classList.add(currentPlayer.marker.toLowerCase());
        cells[index].classList.add('pop');
        
        const winner = checkWinner();
        if (winner) {
            gameOver = true;
            
            if (winner === "X") {
                player1Wins++;
                highlightWinningCells();
                showToast(`${player1.name} wins!`);
            } else if (winner === "O") {
                player2Wins++;
                highlightWinningCells();
                showToast(`${player2.name} wins!`);
            } else { // draw
                draws++;
                showToast("It's a draw!");
            }
            
            updateScoreboard();
            
            setTimeout(() => {
                resetGame();
            }, 2000);
            return;
        }
        
        switchTurn();
    }
    
    function resetGame() {
        Gameboard.resetBoard();
        gameOver = false;
        currentPlayer = player1;
        winningCells = [];
        updateActivePlayer();
        renderBoard();
    }
    
    function resetScores() {
        player1Wins = 0;
        player2Wins = 0;
        draws = 0;
        updateScoreboard();
    }
    
    function getCurrentPlayer() {
        return currentPlayer;
    }
    
    function isGameOver() {
        return gameOver;
    }
    
    return { 
        initializePlayers, 
        playTurn, 
        getCurrentPlayer, 
        resetGame, 
        resetScores, 
        isGameOver 
    };
})();

// UI functions
function renderBoard() {
    const boardContainer = document.getElementById("gameboard");
    boardContainer.innerHTML = ""; // Clear previous board
    
    Gameboard.getBoard().forEach((cell, index) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        
        if (cell) {
            cellElement.textContent = cell;
            cellElement.classList.add(cell.toLowerCase());
        }
        
        cellElement.addEventListener("click", () => handleMove(index));
        boardContainer.appendChild(cellElement);
    });
}

function handleMove(index) {
    GameController.playTurn(index);
    renderBoard();
}

// Handle player name form
function showPlayerNameModal() {
    document.getElementById("player-modal").style.display = "flex";
}

function hidePlayerNameModal() {
    document.getElementById("player-modal").style.display = "none";
}

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
    // Show the player name modal when the page loads
    showPlayerNameModal();

    // Add close button functionality
    document.querySelector(".close-modal").addEventListener("click", () => {
        hidePlayerNameModal();
        // If it's the first game (no players set), use default names
        if (!GameController.getCurrentPlayer()) {
            GameController.initializePlayers("Player X", "Player O");
            GameController.resetGame();
            showToast("Game started with default players!");
        }
    });
    
    // Handle form submission
    document.getElementById("player-form").addEventListener("submit", function(event) {
        event.preventDefault();
        
        const player1Name = document.getElementById("player1-input").value.trim() || "Player X";
        const player2Name = document.getElementById("player2-input").value.trim() || "Player O";
        
        GameController.initializePlayers(player1Name, player2Name);
        GameController.resetScores();
        GameController.resetGame();
        hidePlayerNameModal();
        
        // Welcome message
        showToast(`Welcome ${player1Name} & ${player2Name}! Game started.`);
    });
    
    // Reset button
    document.getElementById("reset-button").addEventListener("click", () => {
        GameController.resetGame();
        showToast("Game reset!");
    });
    
    // New Game button
    document.getElementById("new-game-button").addEventListener("click", () => {
        showPlayerNameModal();
        document.getElementById("player1-input").value = "";
        document.getElementById("player2-input").value = "";
    });
    
    // Initial render
    renderBoard();
});