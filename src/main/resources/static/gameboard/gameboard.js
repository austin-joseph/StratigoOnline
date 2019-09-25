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
        var prevHilightedCell = null;
        var currentlyHilightedCell = null;
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
}
class SetupPhase {
    constructor() {
        // this.lastPressedKey = null;
        this.keyTracker = {};
        this.keyTracker["F"] = 1;
        this.keyTracker["B"] = 6;
        this.keyTracker["0"] = 1;//Marshal
        this.keyTracker["1"] = 1;//The Spy
        this.keyTracker["2"] = 8;//The scout
        this.keyTracker["3"] = 5;//The Miner
        this.keyTracker["4"] = 4;//Sergeant
        this.keyTracker["5"] = 4;//Lieutenant
        this.keyTracker["6"] = 4;//Captain
        this.keyTracker["7"] = 3;//Major
        this.keyTracker["8"] = 2;//Colonel
        this.keyTracker["9"] = 1;//General
        this.keyTracker[""] = 0;//Blank Space
        this.createInfoSection();
    }
    onKeyPress(event) {
        if (event.key == "Enter") {
            game.phase.attemptStartGame();
        } else if (event.key == "End") {
            game.phase.finishPhase();
        }else if (event.key == "Delete") {
            if (game.currentlyHilightedCell != null) { 
                game.phase.placePieceAt("", game.currentlyHilightedCell); 
            }
        } else if (event.key.toUpperCase() == "B" || event.key.toUpperCase() == "F") {
            if (game.currentlyHilightedCell != null) { 
                game.phase.placePieceAt(event.key.toUpperCase(), game.currentlyHilightedCell); 
            }
            // game.phase.lastPressedKey = event.key
        } else {
            if (event.key >= "0" && event.key <= "9") {
                if (game.currentlyHilightedCell != null) game.phase.placePieceAt(event.key, game.currentlyHilightedCell);
                // game.phase.lastPressedKey = (value == 0) ? "10" : ("" + value);
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

        var row = cell.substring(0, 1);
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
                }else if(piece == "") {
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

            tr1.append($($.parseHTML("<th>" + i + "</th>")));
            tr2.append($($.parseHTML("<td>" + this.keyTracker[i] + "</td>")));
        }
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

        for (var row = 1; row <= 4; row++) {
            for (var column = "A"; column != "K"; column = String.fromCharCode(column.charCodeAt(0) + 1)) {
                $("#" + row + column).addClass("gameboard-enemy gameboard-transparent");
            }
        }
        game.phase = new PlayPhase();
    }
}
class PlayPhase {
    constructor() {
        this.keyTracker = {};
        this.keyTracker["F"] = 1;
        this.keyTracker["B"] = 6;
        this.keyTracker["0"] = 1;//Marshal
        this.keyTracker["1"] = 1;//The Spy
        this.keyTracker["2"] = 8;//The scout
        this.keyTracker["3"] = 5;//The Miner
        this.keyTracker["4"] = 4;//Sergeant
        this.keyTracker["5"] = 4;//Lieutenant
        this.keyTracker["6"] = 4;//Captain
        this.keyTracker["7"] = 3;//Major
        this.keyTracker["8"] = 2;//Colonel
        this.keyTracker["9"] = 1;//General
        this.keyTracker[""] = 0;//Blank Space        
        this.hiddenPieces = {};

        var count = 40;
        var letters = "ABCDEFGHIJ";

        while(count > 0) {
            var col = Math.floor(Math.random() * 10);
            var row = Math.floor(Math.random() * 10);
            var val = $("#" + letters.charAt(col) + row).html();
            if(val == null || val == ""){
                console.log("#" + letters.charAt(col) + row + "\n");
                console.log($("#" + letters.charAt(col) + row).html() + "\n");
                continue;
            }
            for(var x in this.keyTracker) {
                if(this.keyTracker[x] > 0) {
                    $("#" + letters.charAt(col) + row).html(x);
                    // this.hiddenPieces = {};
                    this.keyTracker[x] = this.keyTracker[x] -1;
                    count = count -1;
                     console.log("#" + letters.charAt(col) + row)
                    break;
                }
            }
        }
    }

    onCellClicked(id) {
        if(game.prevHilightedCell != null && game.currentlyHilightedCell != null) {
            
            var startCell= game.prevHilightedCell;
            var endCell= game.currentlyHilightedCell;

            var pieceOneTeam = $("#"+startCell).hasClass("gameboard-player");
            if(!pieceOneTeam) {
                var pieceOneTeam = $("#"+startCell).hasClass("gameboard-enemy") 
                if(pieceOneTeam) {
                    pieceOneTeam = 2;
                }else {
                    pieceOneTeam = 0;
                }
            }else {
                pieceOneTeam = 1;
            }
            var pieceTwoTeam = $("#"+endCell).hasClass("gameboard-player");
            if(!pieceTwoTeam) {
                var pieceTwoTeam = $("#"+endCell).hasClass("gameboard-enemy") 
                if(pieceTwoTeam) {
                    pieceTwoTeam = 2;
                }else {
                    pieceTwoTeam = 0;
                }
            }else {
                pieceTwoTeam = 1;
            }

            var startPiece = "";
            switch(pieceOneTeam){
                case 1:{
                    startPiece = $("#"+startCell).html();
                    break;
                }
                case 2:{
                    break;
                }
            }

            switch(pieceTwoTeam){
                case 0:{
                    break;
                }
                case 1:{
                    break;
                }
                case 2:{
                    break;
                }
            }
            var endPiece = $("#"+endCell).html();


            var moveSucessful = game.phase.move(startCell, endCell, startPiece, endPiece, pieceOneTeam, pieceTwoTeam);
            if (moveSucessful) {
                game.phase.attemptEndGame();
                game.phase.aiTurn();
            }
        }
    }
    move(startCell, endCell, startPiece, endPiece, startPieceTeam, endPieceTeam) {

      
        console.log("One "+startCell + " " + startPiece+" " +startPieceTeam+ "\n");
        console.log("Two "+endCell + " " + endPiece+" " +endPieceTeam+ "\n");
        // console.log(endPiece + "\n");
        return true;
    }
    aiTurn() {

    }
    attemptEndGame() {
        //See if some body won or if a draw has happened. If so change the phase 
    }
    finishPhase() {
        game.phase = new EndPhase(this);
    }
}
class EndPhase {
    constructor() {
    }
}
//When everything has finished loading we add the board to the DOM then start our javascript game code.
$(document).ready(function () {
    createGameBoard();
    startGame();
});