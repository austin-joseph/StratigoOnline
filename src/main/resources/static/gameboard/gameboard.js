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
            if (game.phase.onCellClicked != null) {
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
            success: function (data) {
                console.log('successfully posted data! response body: ' + data);
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

        var row = cell.split(cell.length - 1)[0];
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
        // this.hiddenPieces = {};

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
        // game.sendGameData();
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
            console.log("Move: " + moveSucessful);
            if (moveSucessful) {
                //code to save move of user
                game.tempObject2 = [startCell, endCell, $("#" + endCell).html(), game.getOwningPlayer(endCell)];
                game.history.moves.push(game.tempObject2);

                saveBoardState();
                //game.sendGameData();
                game.phase.attemptEndGame();
                game.phase.aiTurn();

                saveBoardState();
                game.phase.attemptEndGame();
            }
        }
    }
    move(startCell, endCell, startPiece, endPiece, startPieceTeam, endPieceTeam, currentTurn) {
        if (startPiece == "" || startPiece == "B" || startPiece == "F") {
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
                $("#" + endCell).addClass("gameboard-enemy gameboard-transparent");
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
                $("#" + endCell).addClass("gameboard-enemy gameboard-transparent");
                $("#" + startCell).html("");
            }
            return true;
        } else {
            // Compare the strength of the pieces and the highlest level wins
            if (currentTurn == 1) {
                if (Number(startPiece) < Number(endPiece)) {
                    $("#" + startCell).removeClass("gameboard-player");
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
                    $("#" + endCell).addClass("gameboard-enemy gameboard-transparent");
                    $("#" + startCell).html("");
                    $("#" + endCell).html(startPiece);
                } else {
                    $("#" + startCell).removeClass("gameboard-enemy gameboard-transparent");
                    $("#" + endCell).removeClass("gameboard-enemy");
                    $("#" + startCell).html("");
                    $("#" + endCell).html("");
                }
                return true;
            }
        }
        return false;
    }
    aiTurn() {

        var moveSuccess = 0;

        // check available pieces in each row
        var availablePieces = "";
        for (var row = 10; row <= 1; row--) {

            // if AI move is successful break out of loop to stop searching
            if (moveSuccess == 1) {
                break;
            }

            // check each row for available pieces
            for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
                if ($("#" + row + column).hasClass("gameboard-enemy") && $("#" + row + column).html() != "") {

                    availablePieces = availablePieces.concat($("#" + row + column).html());
                }
            }

            // continuously select a random piece from available pieces to see if a move is possible
            var move = 0;
            while (move == 0) {

                //move(startCell, endCell, startPiece, endPiece, startPieceTeam, endPieceTeam, currentTurn)

                var piece = availablePieces.charAt(Math.floor(Math.random() * availabePieces.length));
                // if move successful set the variables, so that loop breaks out on next iteration
                if (move()) {
                    move = 1;
                    moveSuccess == 1;

                } else {
                    // else remove piece from available pieces and try another pieces
                    availablePieces = availablePieces.remove(piece, "");
                }
            }

            // reset the availablePieces for next loop iteration
            availablePieces = "";

        }


    }
    attemptEndGame() {
        /** Conditions for winning the game. 
         The enemy flag is destroyed. 
         If all your movable pieces have been removed and you cannot move or attack on a turn, you lose.
         
         **/


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
                finishPhase(2);

            } else if (playerFlag == 1 && aiFlag == 0) {
                // player won
                finishPhase(1);

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
                    finishPhase(2);
                } else if (playerMovablePieces == 1 && aiMovablePieces == 0) {
                    // player won
                    finishPhase(1);
                }
            }
        }
    }

    finishPhase(team){
        game.history.winner = team;
        game.phase = new EndPhase(this);
    }
}
class EndPhase {
    constructor() {
        game.sendGameData();
    }
}
//When everything has finished loading we add the board to the DOM then start our javascript game code.
$(document).ready(function () {
    createGameBoard();
    startGame();

    $("#backward").click(function () {
        console.log("BACKWARD");
    });

    $("#forward").click(function () {
        console.log("FORWARD");
    });

    $('#gameEndsModal').modal('hide');
});