const BOARD_SIZE = 3;

class TTTBoard {
    // grid is an array denoting the board's current state
    constructor(grid) {
        this.grid = grid;
    }

    checkRows() {
        for (var i = 0; i < BOARD_SIZE; i++) {
            var hasWon = true;
            var start = BOARD_SIZE * i;

            while (start < BOARD_SIZE * (i + 1) - 1 && hasWon) {
                
                if (this.grid[start] == ' ' || this.grid[start] != this.grid[start + 1]) {
                    hasWon = false;
                }     

                start++;          
            }

            if (hasWon)
                return this.grid[start];
        }
        return ' '; // No one has won yet
    }

    checkCols() {
        for (var i = 0; i < BOARD_SIZE; i++) {
            var hasWon = true;
            var start = i;

            while (start < i + BOARD_SIZE * (BOARD_SIZE - 1) && hasWon) {
               
                if (this.grid[start] == ' ' || this.grid[start] != this.grid[start + BOARD_SIZE]) {
                    hasWon = false;
                }   

                start += BOARD_SIZE;                
            }

            if (hasWon)
                return this.grid[BOARD_SIZE * i];
        }
        return ' '; // No one has won yet
    }
    
    checkDiagonals() {
        // Left-Right Diagonal
        var i = 0;
        var hasWon = true;

        while (i < BOARD_SIZE * BOARD_SIZE - 1 && hasWon) {
            
            if (this.grid[i] == ' ' || this.grid[i] != this.grid[i + BOARD_SIZE + 1]) {
                hasWon = false;
            }  

            i += BOARD_SIZE + 1;                
        }

        if (hasWon)
            return this.grid[i];

        // Right-Left Diagonal
        i = BOARD_SIZE - 1;
        hasWon = true;
        
        while (i < BOARD_SIZE * (BOARD_SIZE - 1) && hasWon) {
            
            if (this.grid[i] == ' ' && this.grid[i] == this.grid[i + BOARD_SIZE - 1]) {
                hasWon = false;
            }  
                       
            i += BOARD_SIZE - 1;                
        }

        if (hasWon)
            return this.grid[i];

        return ' '; // No one has won yet        
    }

    getWinner() {
        var winner = this.checkRows();
        if (winner == ' ') winner = this.checkCols();
        if (winner == ' ') winner = this.checkDiagonals();   
        return winner;         
    }

    isGameDone() {
        if (this.getWinner() != ' ')
            return true;

        return !this.isWinPossible('X') && !this.isWinPossible('O');
    }

    isWinPossible(player) {
        var temp = this.grid;
        var a = this.grid.slice(0);
        this.grid = a;
   
        for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) 
            if (a[i] == ' ')
                a[i] = player;  
                
        var possible =  this.getWinner(a) == player;
        this.grid = temp;
        return possible
    }
}

class TTTBoardNode {
    
    // A TTTBoard object
    constructor(board, currentTurn) {
        this.board = board;
        this.currentTurn = currentTurn;
        this.children = [];
        this.probabilities = new TTTProbabilities();
    }
    
    buildTree() {
        this._buildTree(this, this.currentTurn);
    }

    _buildTree(node, turn) {
        var currentBoard = node.board;

        if (!currentBoard.isGameDone()) {
            for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
                if (currentBoard.grid[i] == ' ') {
                    var nextGrid = currentBoard.grid.slice(0);
                    nextGrid[i] = turn;
                    var nextBoard = new TTTBoard(nextGrid);
                    var nextNode = new TTTBoardNode(nextBoard);

                    node.children.push(nextNode);
                    this._buildTree(nextNode, this.getNextTurn(turn));


                }
            }
        }
        else {
            var winner = currentBoard.getWinner();
           
            if (winner == 'X')
                this.probabilities.xWin++;
            else if (winner == 'O')
                this.probabilities.oWin++;
            else
                this.probabilities.draw++;

            this.probabilities.numGames++;
          
        }
    }

    getNextTurn(turn) {
        if (turn == 'X') return 'O';
        else if (turn == 'O') return 'X';
        return ' ';
    }
}

class TTTProbabilities {

    constructor() {
        this.xWin = 0;
        this.oWin = 0;
        this.draw = 0;
        this.numGames = 0;
    }

}

var a = new TTTBoardNode(new TTTBoard([ "X", " ", " "," ", " ", " ", " ", " ", " "]), "O")

a.buildTree();
console.log(a.probabilities)