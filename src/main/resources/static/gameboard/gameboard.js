//This all starts with the jQuery on document ready function at the bottom of the document.

//The game board is generated usign HTML because it allows easy changes to the code without having to make many repetive changes to the html directly. All that has to be modified is the template and the entire board relfects those chagnes. 
function createGameBoard() {
    //These are the letters that server as the column names on the board. There is a space in the beginning and end so that there is space for the columns that hold the row markers.
    var letters = " ABCDEFGHIJ ";
    //I use jQuery to modify the DOM to make it easy to add elements programically.
    var table = $($.parseHTML("<table id=\"gameboard-table\" class=\"center\"></table>"));
    var thead = $($.parseHTML("<thead></thead>"));

    //Create the columns as part of a thead element
    for (var i = 0; i < letters.length; i++) {
        var charAt = letters.charAt(i);
        if (charAt == ' ') {
            thead.append($($.parseHTML("<th class=\"gameboard-cornerMarker\">" + letters.charAt(i) + "</th>")));
        } else {
            thead.append($($.parseHTML("<th class=\"gameboard-horiMarker\">" + letters.charAt(i) + "</th>")));
        }
    }
    //Create the body and make sure each part has the correct classes so they can be styled correctly
    var tbody = $($.parseHTML("<tbody></tbody>"));
    for (var numbers = 0; numbers < 10; numbers++) {
        var output = $($.parseHTML("<tr></tr>"));
        for (var letter = 0; letter < letters.length; letter++) {
            var charAt = letters.charAt(letter);
            var row;
            if (charAt == ' ') {
                row = $($.parseHTML("<th class=\"gameboard-vertMarker\">" + (numbers + 1) + "</th>"));
            } else {
                if ((numbers == 4 || numbers == 5) && (charAt == "C" || charAt == "D" || charAt == "G" || charAt == "H")) {
                    row = $($.parseHTML("<td class=\"gameboard-cell gameboard-impassable\" id=\"" + ((numbers + 1) + charAt) + "\"></td>"));
                } else {
                    row = $($.parseHTML("<td class=\"gameboard-cell gameboard-empty\" id=\"" + ((numbers + 1) + charAt) + "\"></td>"));
                }
                row.click(this.onCellClicked);
            }
            output.append(row);
        }
        tbody.append(output);
    }
    //Actually add the elements to the DOM now that we've created them
    table.append(thead);
    table.append(tbody);
    //We have to actually make a clone of the thead cause otherwise we would move the thead we created from the top of the document to the bottom.
    table.append(thead.clone());
    $("#gameboard").append(table);
}

var game;

function startGame() {
    game = new Game();
    game.begin();
}

function onCellClicked(e) {
    if (game != null) {
        game.onCellClicked(e.currentTarget.id);
    }
}

class Game {
    constructor() {
        this.history = {};
        this.history.boardState = [];
        this.history.moves = [];
        this.history.winner = "";
        this.turnCount = 0;
        this.history.userPiecesLost = [];
        this.history.aiPiecesLost = [];

    }
    begin() {
        this.phase = new SetupPhase(this);
        document.addEventListener('keydown', this.phase.onKeyPress);
    }
    onCellClicked(id) {
        if (!$("#" + id).hasClass("gameboard-impassable")) {
            //Remove previous hilight
            if (game.currentlyHilightedCell != null) {
                $("#" + game.currentlyHilightedCell).removeClass("gameboard-selected");
            }
            game.prevHilightedCell = game.currentlyHilightedCell;
            game.currentlyHilightedCell = id;
            //Add new hilight
            if (game.currentlyHilightedCell != null) {
                $("#" + game.currentlyHilightedCell).addClass("gameboard-selected");
            }
            if (game.phase.onCellClicked != null && !game.finished) {
                game.phase.onCellClicked(id);
            }
        }
    }
    getOwningPlayer(endCell) {
        if ($("#" + endCell).hasClass("gameboard-enemy")) {
            return "2";
        } else if ($("#" + endCell).hasClass("gameboard-player")) {
            return "1";
        } else {
            return "0";
        }
    }
    sendGameData() {
        $.ajax({
            url: "/recordGame",
            type: "POST",
            data: JSON.stringify(game.history), // name of the post variable ($_POST['id'])
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                //console.log('successfully posted data! response body: ' + data);
            }
        });
    }
}

function saveBoardState() {
    game.tempObject = {};
    for (var row = 1; row <= 10; row++) {
        for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
            if ($("#" + row + column).hasClass("gameboard-enemy")) {
                game.tempObject["" + row + column] = [$("#" + row + column).html(), "2"];
            } else if ($("#" + row + column).hasClass("gameboard-player")) {
                game.tempObject["" + row + column] = [$("#" + row + column).html(), "1"]
            } else {
                game.tempObject["" + row + column] = [$("#" + row + column).html(), "0"]
            }
        }
    }
    game.history.boardState.push(game.tempObject)
}

class SetupPhase {
    constructor() {
        // this.lastPressedKey = null;
        this.keyTracker = {};
        this.keyTracker["F"] = 1;
        this.keyTracker["B"] = 6;
        this.keyTracker["1"] = 1; //The Spy
        this.keyTracker["2"] = 8; //The scout
        this.keyTracker["3"] = 5; //The Miner
        this.keyTracker["4"] = 4; //Sergeant
        this.keyTracker["5"] = 4; //Lieutenant
        this.keyTracker["6"] = 4; //Captain
        this.keyTracker["7"] = 3; //Major
        this.keyTracker["8"] = 2; //Colonel
        this.keyTracker["9"] = 1; //General
        this.keyTracker["10"] = 1; //Marshal
        this.keyTracker[""] = 0; //Blank Space
        this.createInfoSection();
    }
    onKeyPress(event) {
        if (event.key == "Enter") {
            game.phase.attemptStartGame();
        } else if (event.key == "End") {
            game.phase.finishPhase();
        } else if (event.key == "Delete") {
            if (game.currentlyHilightedCell != null) {
                game.phase.placePieceAt("", game.currentlyHilightedCell);
            }
        } else if (event.key.toUpperCase() == "B" || event.key.toUpperCase() == "F") {
            if (game.currentlyHilightedCell != null) {
                game.phase.placePieceAt(event.key.toUpperCase(), game.currentlyHilightedCell);
            }
        } else {
            if ((event.key >= "0" && event.key <= "9")) {
                if (game.currentlyHilightedCell != null)
                    game.phase.placePieceAt((event.key == 0) ? "10" : ("" + event.key), game.currentlyHilightedCell);
            }
        }
    }
    attemptStartGame() {
        var leftOver = 0;
        for (var i in this.keyTracker) {
            if (this.keyTracker[i] != 0 && i != "") {
                leftOver += this.keyTracker[i];
            }
        }
        if (leftOver == 0) {
            this.finishPhase();
        }
    }
    placePieceAt(piece, cell) {
        //Dont allow if they try to place something into the impassible cells or on the enemy side.

        var row = cell.slice(0, cell.length - 1);
        if (row < 7) {
            return;
        }
        //Determine what type of piece is in the existing square.
        var existingKey = $("#" + cell).html();

        //The player clicks on a cell that is empty. Check if they have enough of that piece left to place, if so add the piece
        //The player is clicking on an already existing piece, add back another of the removed piece to the reserve and remove the          
        if (existingKey != null && existingKey != piece) {
            if (this.keyTracker[piece] > 0) {
                this.keyTracker[existingKey] = this.keyTracker[existingKey] + 1;
                this.keyTracker[piece] = this.keyTracker[piece] - 1;

                if (existingKey == "") {
                    $("#" + cell).removeClass("gameboard-empty");
                    $("#" + cell).addClass("gameboard-player");
                } else if (piece == "") {
                    $("#" + cell).removeClass("gameboard-player");
                    $("#" + cell).addClass("gameboard-empty");
                }
                $("#" + cell).html(piece);
            }
        }
        this.updateInfoSection();
    }

    createInfoSection() {
        var tbody = $("#info-table");
        var tr1 = $($.parseHTML("<tr></tr>"));
        var tr2 = $($.parseHTML("<tr id=\"info-row2\"></tr>"));
        for (var i in this.keyTracker) {

            tr1.append($($.parseHTML("<th>" + i + '\xa0\xa0\xa0' + "</th>")));
            tr2.append($($.parseHTML("<td>" + this.keyTracker[i] + "</td>")));
            if (i == "B") {
                tr2.append('\xa0');
            }
        }
        tr1.append("Total");
        tbody.append(tr1);
        tbody.append(tr2);
    }
    updateInfoSection() {
        var row = $("#info-row2");
        row.html("");
        for (var i in this.keyTracker) {
            row.append($($.parseHTML("<td>" + this.keyTracker[i] + "</td>")));
        }
    }
    finishPhase() {
        // Populate the opponents side of the board with pieces.
        game.phase = new PlayPhase();
    }
}

class PlayPhase {
    constructor() {
        this.keyTracker = {};
        this.keyTracker["F"] = 1;
        this.keyTracker["B"] = 6;
        this.keyTracker["1"] = 1; //The Spy
        this.keyTracker["2"] = 8; //The scout
        this.keyTracker["3"] = 5; //The Miner
        this.keyTracker["4"] = 4; //Sergeant
        this.keyTracker["5"] = 4; //Lieutenant
        this.keyTracker["6"] = 4; //Captain
        this.keyTracker["7"] = 3; //Major
        this.keyTracker["8"] = 2; //Colonel
        this.keyTracker["9"] = 1; //General
        this.keyTracker["10"] = 1; //Marshal
        this.keyTracker[""] = 0; //Blank Space

        var keys = ["F", "B", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
        for (var row = 1; row <= 4; row++) {
            for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
                $("#" + row + column).addClass("gameboard-enemy gameboard-transparent");
                $("#" + row + column).removeClass("gameboard-empty");
                var randomKey = keys[Math.floor(Math.random() * keys.length)];
                var value = this.keyTracker[randomKey];
                while (value <= 0) {
                    randomKey = keys[Math.floor(Math.random() * keys.length)];
                    value = this.keyTracker[randomKey];
                }
                this.keyTracker[randomKey] = this.keyTracker[randomKey] - 1;
                $("#" + row + column).html(randomKey);
            }
        }
        saveBoardState();
    }

    onCellClicked() {
        if (game.prevHilightedCell != null && game.currentlyHilightedCell != null) {

            var startCell = game.prevHilightedCell;
            var endCell = game.currentlyHilightedCell;

            var pieceOneTeam = $("#" + startCell).hasClass("gameboard-player");
            if (!pieceOneTeam) {
                var pieceOneTeam = $("#" + startCell).hasClass("gameboard-enemy")
                if (pieceOneTeam) {
                    pieceOneTeam = 2;
                } else {
                    pieceOneTeam = 0;
                }
            } else {
                pieceOneTeam = 1;
            }
            var pieceTwoTeam = $("#" + endCell).hasClass("gameboard-player");
            if (!pieceTwoTeam) {
                var pieceTwoTeam = $("#" + endCell).hasClass("gameboard-enemy")
                if (pieceTwoTeam) {
                    pieceTwoTeam = 2;
                } else {
                    pieceTwoTeam = 0;
                }
            } else {
                pieceTwoTeam = 1;
            }

            var startPiece = $("#" + startCell).html();
            var endPiece = $("#" + endCell).html();

            var moveSucessful = game.phase.move(startCell, endCell, startPiece, endPiece, pieceOneTeam, pieceTwoTeam, 1);
            if (moveSucessful) {
                //code to save move of user    
                game.phase.saveMove(startCell, endCell, startPiece, endPiece, pieceOneTeam, pieceTwoTeam, 1);

                saveBoardState();
                //game.sendGameData();
                if (!game.phase.attemptEndGame()) {

                    game.phase.aiTurn();

                    saveBoardState();
                    game.phase.attemptEndGame();
                }
            }
        }
    }
    saveMove(startCell, endCell, startPiece, endPiece, pieceOneTeam, pieceTwoTeam, pieceOwner) {
        var deadPiece;
        var deadPieceTeam;
        if ($("#" + endCell).html() == startPiece) {
            deadPiece = endPiece;
            deadPieceTeam = pieceTwoTeam;
        } else if (startPiece == endPiece) {
            deadPiece = endPiece;
            deadPieceTeam = 3;
        } else if (startPiece == endPiece) {
            deadPiece = endPiece;
            deadPieceTeam = 3;
        } else {
            deadPiece = startPiece;
            deadPieceTeam = pieceOneTeam
        }

        if (deadPiece != "") {
            if (deadPieceTeam == 1) {
                game.history.userPiecesLost.push(deadPiece);
            } else if (deadPieceTeam == 2) {
                game.history.aiPiecesLost.push(deadPiece);
            } else if (deadPieceTeam == 3) {
                game.history.userPiecesLost.push(deadPiece);
                game.history.aiPiecesLost.push(deadPiece);
            }
        }
        game.tempObject2 = [startCell, endCell, $("#" + endCell).html(), game.getOwningPlayer(endCell), deadPiece];
        game.history.moves.push(game.tempObject2);

        this.updateTable(startPiece, startCell, endCell, deadPiece, pieceOwner, deadPieceTeam);
    }

    updateTable(startPiece, startCell, endCell, deadPiece, pieceOwner, deadPieceOwner) {
        game.turnCount++;
        if (deadPieceOwner == 3) {
            $('#tbody-move-history').prepend('<tr><td><strong>' + game.turnCount + '</strong></td><td style="color: #0062cc;">' + startPiece + '</td><td>' + startCell + '</td><td>' + endCell + '</td><td><span style="color: #0062cc;">' + deadPiece + '</span><span>, </span><span style="color: red;">' + deadPiece + '</span></td></tr>');
        } else {
            if (pieceOwner == 1) {
                if (deadPieceOwner == 1) {
                    $('#tbody-move-history').prepend('<tr><td><strong>' + game.turnCount + '</strong></td><td style="color: #0062cc;">' + startPiece + '</td><td>' + startCell + '</td><td>' + endCell + '</td><td style="color: #0062cc;">' + deadPiece + '</td></tr>');
                } else {
                    $('#tbody-move-history').prepend('<tr><td><strong>' + game.turnCount + '</strong></td><td style="color: #0062cc;">' + startPiece + '</td><td>' + startCell + '</td><td>' + endCell + '</td><td style="color: red;">' + deadPiece + '</td></tr>');
                }

            } else { //pieceOwner == 2
                if (deadPieceOwner == 1) {
                    $('#tbody-move-history').prepend('<tr><td><strong>' + game.turnCount + '</strong></td><td style="color: red;">' + startPiece + '</td><td>' + startCell + '</td><td>' + endCell + '</td><td style="color: #0062cc;">' + deadPiece + '</td></tr>');
                } else {
                    $('#tbody-move-history').prepend('<tr><td><strong>' + game.turnCount + '</strong></td><td style="color: red;">' + startPiece + '</td><td>' + startCell + '</td><td>' + endCell + '</td><td style="color: red;">' + deadPiece + '</td></tr>');
                }

            }
        }
    }

    move(startCell, endCell, startPiece, endPiece, startPieceTeam, endPieceTeam, currentTurn) {
        if (startPiece == "" || startPiece == "B" || startPiece == "F") {
            return false;
        }
        if (startCell == "5C" || startCell == "5D" || startCell == "6C" || startCell == "6D" || startCell == "5G" || startCell == "5H" || startCell == "6G" || startCell == "6H" ||
            endCell == "5C" || endCell == "5D" || endCell == "6C" || endCell == "6D" || endCell == "5G" || endCell == "5H" || endCell == "6G" || endCell == "6H") {
            return false;
        }
        if (startPieceTeam != currentTurn) {
            return false;
        }
        if (endPieceTeam == currentTurn) {
            return false;
        }
        var startColumn = startCell.slice(0, startCell.length - 1);
        var startRow = startCell.slice(-1);
        var endColumn = endCell.slice(0, endCell.length - 1);
        var endRow = endCell.slice(-1);

        if (startColumn != endColumn && startRow != endRow) {
            return false;
        }
        if (startPiece != "2" && (Math.abs(Number(startColumn) - Number(endColumn)) + Math.abs(startRow.charCodeAt(0) - endRow.charCodeAt(0))) > 1) {
            return false;
        }
        if (startPiece == '3') { // MINER
            // if miner strikes bomb or moving into empty space
            if (endPiece == "B") {
                if (currentTurn == 1) {
                    $("#" + startCell).removeClass("gameboard-player");
                    $("#" + endCell).removeClass("gameboard-transparent");
                    $("#" + endCell).addClass("gameboard-player");
                    $("#" + startCell).html("");
                    $("#" + endCell).html(startPiece);
                } else if (currentTurn == 2) {
                    $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + endCell).addClass("gameboard-enemy");
                    $("#" + startCell).html("");
                    $("#" + endCell).html(startPiece);
                }
                return true;
            }
        } else if (startPiece == "1") { // SPY
            if (endPiece == "10") {
                // if spy attacks marshall, marshall is destroyed and removed
                if (currentTurn == 1) {
                    $("#" + startCell).removeClass("gameboard-player");
                    $("#" + endCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + endCell).addClass("gameboard-player");
                    $("#" + startCell).html("");
                    $("#" + endCell).html(startPiece);
                } else if (currentTurn == 2) {
                    $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + endCell).removeClass("gameboard-player");
                    $("#" + endCell).addClass("gameboard-enemy");
                    $("#" + startCell).html("");
                    $("#" + endCell).html(startPiece);
                }
                return true;
            }
        }
        // normally ranked pieces (non scout, miner, spy)

        // move into blank space
        if (endPiece == "") {
            if (currentTurn == 1) {
                $("#" + startCell).removeClass("gameboard-player");
                $("#" + endCell).addClass("gameboard-player");
                $("#" + startCell).html("");
                $("#" + endCell).html(startPiece);
            } else if (currentTurn == 2) {
                $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                $("#" + endCell).addClass("gameboard-enemy gameboard-transparent");
                $("#" + startCell).html("");
                $("#" + endCell).html(startPiece);
            }
            return true;
        } else if (endPiece == "F") {
            // Move the piece and win the game.
            if (currentTurn == 1) {
                $("#" + startCell).removeClass("gameboard-player");
                $("#" + endCell).removeClass("gameboard-enemy gameboard-transparent");
                $("#" + endCell).addClass("gameboard-player");
                $("#" + startCell).html("");
                $("#" + endCell).html(startPiece);
            } else if (currentTurn == 2) {
                $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                $("#" + endCell).removeClass("gameboard-player");
                $("#" + endCell).addClass("gameboard-enemy");
                $("#" + startCell).html("");
                $("#" + endCell).html(startPiece);
            }
            return true;
        } else if (endPiece == "B") {
            // if bomb is attacked
            if (currentTurn == 1) {
                $("#" + startCell).removeClass("gameboard-player");
                $("#" + endCell).removeClass("gameboard-transparent");
                $("#" + startCell).html("");
            } else if (currentTurn == 2) {
                $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                $("#" + startCell).html("");
            }
            return true;
        } else {
            // Compare the strength of the pieces and the highlest level wins
            if (currentTurn == 1) {
                if (Number(startPiece) < Number(endPiece)) {
                    $("#" + startCell).removeClass("gameboard-player");
                    $("#" + endCell).removeClass("gameboard-transparent");
                    $("#" + startCell).html("");
                } else if (Number(startPiece) > Number(endPiece)) {
                    $("#" + startCell).removeClass("gameboard-player");
                    $("#" + endCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + endCell).addClass("gameboard-player");
                    $("#" + startCell).html("");
                    $("#" + endCell).html(startPiece);
                } else {
                    $("#" + startCell).removeClass("gameboard-player");
                    $("#" + endCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + startCell).html("");
                    $("#" + endCell).html("");
                }
                return true;
            } else if (currentTurn == 2) {
                if (Number(startPiece) < Number(endPiece)) {
                    $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + startCell).html("");
                } else if (Number(startPiece) > Number(endPiece)) {
                    $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + endCell).removeClass("gameboard-player");
                    $("#" + endCell).addClass("gameboard-enemy");
                    $("#" + startCell).html("");
                    $("#" + endCell).html(startPiece);
                } else {
                    $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + endCell).removeClass("gameboard-player");
                    $("#" + startCell).html("");
                    $("#" + endCell).html("");
                }
                return true;
            }
        }
        return false;
    }

    listValidMoves(cell) {
        var column = cell.slice(-1);
        var row = cell.slice(0, cell.length - 1);

        var output = [];

        for (var x = -1; x < 2; x++) {
            var checkingColumn = column.charCodeAt(0) + x;
            if (checkingColumn < "A".charCodeAt(0) || checkingColumn > "J".charCodeAt(0)) {
                continue;
            }
            for (var y = -1; y < 2; y++) {
                if (Math.abs(x) + Math.abs(y) != 2 && Math.abs(x) + Math.abs(y) != 0) {

                    var checkingRow = Number(row) + y;
                    if (checkingRow < 1 || checkingRow > 10) {
                        continue;
                    }
                    // console.log(x + " " + y);
                    output.push(checkingRow + String.fromCharCode(checkingColumn));
                }
            }
        }

        var temp = [];
        while (output.length > 0) {
            temp.push(output.splice(Math.random() * output.length, 1)[0]);
        }
        return temp;
    }

    autoPlayPlayer() {
        var passedPieces = [];
        while (passedPieces.length <= 40) {

            var row = Math.floor(Math.random() * 10);
            var column = String.fromCharCode("A".charCodeAt(0) + Math.floor(Math.random() * 10));
            if (passedPieces.includes(row + column)) {
                continue;
            } else {
                passedPieces.push(row + column);
            }
            //Find the first piece that can be moved. 
            var piece = $("#" + row + column).html();

            if ($("#" + row + column).hasClass("gameboard-player") && piece != "" && piece != "B" && piece != "F") {

                var possibleMoves = game.phase.listValidMoves(row + column, piece);

                for (var i = 0; i < possibleMoves.length; i++) {
                    var startCell = row + column;
                    var endCell = possibleMoves[i];
                    var startPiece = piece;
                    var endPiece = $("#" + possibleMoves[i]).html();
                    var startOwningPlayer = game.getOwningPlayer(row + column);
                    var endOwningPlayer = game.getOwningPlayer(possibleMoves[i]);
                    var moveSucessful = game.phase.move(startCell, endCell, startPiece, endPiece, startOwningPlayer, endOwningPlayer, 1);
                    if (moveSucessful) {
                        game.phase.saveMove(startCell, endCell, startPiece, endPiece, startOwningPlayer, endOwningPlayer, 1);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    aiTurn() {
        var passedPieces = [];
        while (passedPieces.length <= 40) {

            var row = Math.floor(Math.random() * 10);
            var column = String.fromCharCode("A".charCodeAt(0) + Math.floor(Math.random() * 10));
            if (passedPieces.includes(row + column)) {
                continue;
            } else {
                passedPieces.push(row + column);
            }
            //Find the first piece that can be moved. 
            var piece = $("#" + row + column).html();

            if ($("#" + row + column).hasClass("gameboard-enemy") && piece != "" && piece != "B" && piece != "F") {

                var possibleMoves = game.phase.listValidMoves(row + column, piece);

                for (var i = 0; i < possibleMoves.length; i++) {
                    var startCell = row + column;
                    var endCell = possibleMoves[i];
                    var startPiece = piece;
                    var endPiece = $("#" + possibleMoves[i]).html();
                    var startOwningPlayer = game.getOwningPlayer(row + column);
                    var endOwningPlayer = game.getOwningPlayer(possibleMoves[i]);
                    var moveSucessful = game.phase.move(startCell, endCell, startPiece, endPiece, startOwningPlayer, endOwningPlayer, 2);
                    if (moveSucessful) {
                        game.phase.saveMove(startCell, endCell, startPiece, endPiece, startOwningPlayer, endOwningPlayer, 2);
                        return true;
                    }
                }
            }
        }

        // for (var row = 4; row >= 1; row--) {
        //     for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {

        //     }
        // }
    }

    attemptEndGame() {
        //Conditions for winning the game. 
        // The enemy flag is destroyed. 
        // If all your movable pieces have been removed and you cannot move or attack on a turn, you lose.

        var playerFlag = 0;
        var aiFlag = 0;
        var playerMovablePieces = 0; // 0 is no more movable pieces
        var aiMovablePieces = 0; // 0 is no more movable pieces

        // Check if enemy flag is destroyed
        for (var row = 1; row <= 10; row++) {

            // Check if enemy flag is destroyed
            for (var row = 1; row <= 10; row++) {
                for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
                    if ($("#" + row + column).html() == "F") {
                        if ($("#" + row + column).hasClass("gameboard-player")) {
                            playerFlag = 1;
                        } else if ($("#" + row + column).hasClass("gameboard-enemy")) {
                            aiFlag = 1;
                        }
                    }
                }
            }

            if (playerFlag == 0 && aiFlag == 0) {
                // AI won
                game.phase.finishPhase(2);
                return true;

            } else if (playerFlag == 1 && aiFlag == 0) {
                // player won
                game.phase.finishPhase(1);
                return true;

            } else if (playerFlag == 1 && aiFlag == 1) {
                // if both flags are still present check for other win conditions

                // check if all ur moveable pieces have been removed and you cannot attack move or attack on a turn
                for (var row = 1; row <= 10; row++) {
                    for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
                        var piece = $("#" + row + column).html();
                        if (piece != "F" && piece != "B" && piece != "") {
                            if ($("#" + row + column).hasClass("gameboard-player")) {
                                playerMovablePieces = 1;
                            } else if ($("#" + row + column).hasClass("gameboard-enemy")) {
                                aiMovablePieces = 1;
                            }
                        }
                    }
                }

                if (playerMovablePieces == 0 && aiMovablePieces == 1) {
                    // AI won
                    game.phase.finishPhase(2);
                    return true;
                } else if (playerMovablePieces == 1 && aiMovablePieces == 0) {
                    // player won
                    game.phase.finishPhase(1);
                    return true;
                }
            }
        }
        // else {
        //     // if both flags are still present check for other win conditions

        //     // check if all ur moveable pieces have been removed and you cannot attack move or attack on a turn
        //     for (var row = 1; row <= 10; row++) {
        //         for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
        //             var piece = $("#" + row + column).html();
        //             if (piece != "F" && piece != "B" && piece != "") {
        //                 if ($("#" + row + column).hasClass("gameboard-player")) {
        //                     playerMovablePieces = 1;
        //                 } else if ($("#" + row + column).hasClass("gameboard-enemy")) {
        //                     aiMovablePieces = 1;
        //                 }
        //             }
        //         }
        //     }

        // }
        return false;
    }

    finishPhase(team) {
        game.history.winner = team;
        game.sendGameData();
        game.finished = true;
        if (team == 2) {
            // AI won
            $('#gameEndsModal').modal('show');
            $('#gameEndsModalBodyLabel').append("You Lost!");
        } else if (team == 1) {
            // player won
            $('#gameEndsModal').modal('show');
            $('#gameEndsModalBodyLabel').append('Congratulation! You Won!');
        } else {
            $('#gameEndsModal').modal('show');
            $('#gameEndsModalBodyLabel').append('Its a draw!');
        }
    }
}
//When everything has finished loading we add the board to the DOM then start our javascript game code.
$(document).ready(function() {
    createGameBoard();
    startGame();

    $('#gameEndsModal').modal('hide');

    $("#autoSetup").click(function() {

        if (game.phase instanceof SetupPhase) {
            var keys = ["F", "B", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
            for (var row = 7; row <= 10; row++) {
                for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
                    if ($("#" + row + column).html() != "") {
                        continue;
                    }
                    $("#" + row + column).addClass("gameboard-player");
                    $("#" + row + column).removeClass("gameboard-empty");
                    var randomKey = keys[Math.floor(Math.random() * keys.length)];
                    var value = game.phase.keyTracker[randomKey];
                    while (value <= 0) {
                        randomKey = keys[Math.floor(Math.random() * keys.length)];
                        value = game.phase.keyTracker[randomKey];
                    }
                    game.phase.placePieceAt(randomKey, row + column);
                }
            }
            game.phase.finishPhase();
        }
    });

    $("#autoplay").click(function() {
        if (game.phase instanceof PlayPhase) {
            var moveHappened = game.phase.autoPlayPlayer();

            if (moveHappened) {
                //code to save move of user    
                saveBoardState();
                //game.sendGameData();
                if (!game.phase.attemptEndGame()) {

                    game.phase.aiTurn();

                    saveBoardState();
                    game.phase.attemptEndGame();
                }
            }
        }
    });
});