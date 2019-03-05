$(document).ready(function() {
    $('#ttt_board tr td').each(function() {
        $(this).click(function() {
            if ($(this).html() != 'X' && $(this).html() != 'O') {
                $(this).text('X');
                var moveIndex = 3 * $(this).closest("tr").index() + $(this).closest("td").index();
                $.ajax({
                    type: 'POST',
                    data: {move: moveIndex},
                    url: '/ttt/play',
                    complete: function(data) {
                        var obj = JSON.parse(data.responseText)
                        redrawBoard(obj.grid);
                    }
                });
            }
        });
     });
});

function getGrid() {
    var board = document.getElementById("ttt_board");
    var grid = [];
    if (board != null) {
        for (var i = 0; i < board.rows.length; i++) {
            for (var j = 0; j < board.rows[i].cells.length; j++) {
                if (board.rows[i].cells[j].textContent == 'X' || board.rows[i].cells[j].textContent == 'O')
                    grid.push(board.rows[i].cells[j].textContent);
                else
                    grid.push(' ');
            }
        }
    }
    return grid;
}

function redrawBoard(grid) {
    var board = document.getElementById("ttt_board");
    if (board != null) {
        for (var i = 0; i < grid.length; i++) {
            if (grid[i] == 'X' || grid[i] == 'O') {
                var row = Math.floor(i / 3);
                var col = i % 3;
                board.rows[row].cells[col].textContent = grid[i];
            }

        }
    }    
}

