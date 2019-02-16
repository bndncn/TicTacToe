var board = document.getElementById("ttt_board");
if (board != null) {
    for (var i = 0; i < board.rows.length; i++) {
        for (var j = 0; j < board.rows[i].cells.length; j++) {
            board.rows[i].cells[j].onclick = (function (i, j) {
                return function () {
                    console.log('i = ' + i + ' j = ' + j)
                };
            }(i, j));
        }
    }
}