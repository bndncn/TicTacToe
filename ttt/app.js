const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 80;

app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// app.get('/ttt', (req, res) => res.sendFile('pages/index.ejs', {
//   root: __dirname
// }));

app.get('/ttt', function (req, res) {
  res.render('pages/index')
})

app.get('/css/styles.css', function (req, res) {
  res.sendFile('css/styles.css', {
    root: __dirname
  })
});

app.get('/controllers/board_controller.js', function (req, res) {
  res.sendFile('/controllers/board_controller.js', {
    root: __dirname
  })
});

app.post('/ttt', function (req, res) {
  if (!req.body) return res.sendStatus(400);
  var helloMsg = createHelloMsg(req.body.name);
  console.log(helloMsg);
  res.render('pages/ttt_game', {
    hellomsg: helloMsg
  })
});

app.post('/ttt/play', function (req, res) {
  if (!req.body) return res.sendStatus(400);
  var move = bestAIMove(req.body.grid);
  console.log(req.body.grid);
  console.log(move);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function getDate() {
  var date = new Date();
  var year = date.getFullYear();
  var month = (date.getMonth() + 1 < 10) ? ('0' + (date.getMonth() + 1)) : date.getMonth() + 1;
  var day = (date.getDate() < 10) ? ('0' + date.getDate()) : date.getDate();
  return year + '-' + month + '-' + day;
}

function createHelloMsg(name) {
  return `Hello $${name}, $` + getDate();
}

const BOARD_SIZE = 3;

function checkRows(grid) {
    for (var i = 0; i < BOARD_SIZE; i++) {
        var hasWon = true;
        var start = BOARD_SIZE * i;

        while (start < BOARD_SIZE * (i + 1) - 1 && hasWon) {
            
            if (grid[start] == ' ' || grid[start] != grid[start + 1]) {
                hasWon = false;
            }     

            start++;          
        }

        if (hasWon)
            return grid[start];
    }
    return ' '; // No one has won yet
}

function checkCols(grid) {
    for (var i = 0; i < BOARD_SIZE; i++) {
        var hasWon = true;
        var start = i;

        while (start < i + BOARD_SIZE * (BOARD_SIZE - 1) && hasWon) {
            
            if (grid[start] == ' ' || grid[start] != grid[start + BOARD_SIZE]) {
                hasWon = false;
            }   

            start += BOARD_SIZE;                
        }

        if (hasWon)
            return grid[BOARD_SIZE * i];
    }
    return ' '; // No one has won yet
}
    
function checkDiagonals(grid) {
    // Left-Right Diagonal
    var i = 0;
    var hasWon = true;

    while (i < BOARD_SIZE * BOARD_SIZE - 1 && hasWon) {
        
        if (grid[i] == ' ' || grid[i] != grid[i + BOARD_SIZE + 1]) {
            hasWon = false;
        }  

        i += BOARD_SIZE + 1;                
    }

    if (hasWon)
        return grid[i];

    // Right-Left Diagonal
    i = BOARD_SIZE - 1;
    hasWon = true;
    
    while (i < BOARD_SIZE * (BOARD_SIZE - 1) && hasWon) {
        if (grid[i] == ' ' || grid[i] != grid[i + BOARD_SIZE - 1]) {
            hasWon = false;
        }  
                    
        i += BOARD_SIZE - 1;                
    }
    
    if (hasWon)
        return grid[i];

    return ' '; // No one has won yet        
}

function numTurns(grid) {
    var turns = 0;
    for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        if (grid[i] != ' ')
            turns++;
    }
    return turns;
}

function getWinner(grid) {
    var winner = checkRows(grid);
    if (winner == ' ') winner = checkCols(grid);
    if (winner == ' ') winner = checkDiagonals(grid);   
    return winner;         
}

function isGameDone(grid) {
    if (getWinner(grid) != ' ')
        return true;

    return !isWinPossible(grid, 'X') && !isWinPossible(grid, 'O');
}

function isWinPossible(grid, player) {
    var temp = grid.slice(0);
   
    for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) 
        if (temp[i] == ' ')
            temp[i] = player;  
                
    return getWinner(temp) == player;

}

function bestAIMove(grid) {
    if (isGameDone(grid))
        return getWinner(grid);
    
    if (numTurns(grid) == 1 && grid[4] == ' ')
        grid[4] = 'O'; // If center is empty, place an O there
    else if (numTurns(grid) == 1 && grid[4] == 'X')
        grid[0] = 'O'; // If X starts in the center, choose a corner
    else if (numTurns(grid) == 3 && grid[4] == 'X' && grid[8] == 'X')
        grid[6] = 'O';
    else {
        if (!findWin(grid)) {
            if (!blockWin(grid)) {
                selectRandom(grid);
            }
        }     
    }

    if (isGameDone(grid))
        return getWinner(grid);
    
}

function findWin(grid) {
    for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        var temp = grid.slice(0);
        if (temp[i] == ' ')
            temp[i] = 'O'; 
        if (getWinner(temp) == 'O') {
            grid[i] = 'O';
            return true;
        }
    }
    return false;
} 

function blockWin(grid) {
    for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        var temp = grid.slice(0);
        if (temp[i] == ' ')
            temp[i] = 'X'; 

        if (getWinner(temp) == 'X') {
            grid[i] = 'O'; 
            return true;
        }
    }
    return false;
}

function selectRandom(grid) {
    for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        if (grid[i] == ' ') {
            grid[i] = 'O'; 
            return;
        }
    }
}