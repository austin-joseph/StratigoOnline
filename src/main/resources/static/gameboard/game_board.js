function createGameBoard() {
    var letters = " ABCDEFGHIJ ";
    var table = $($.parseHTML("<table id=\"gameboard-table\" class=\"center\"></table>"));
    var thead = $($.parseHTML("<thead></thead>"));
    //Create the letters
    for (var i = 0; i < letters.length; i++) {
        var charAt = letters.charAt(i);
        if (charAt == ' ') {
            thead.append($($.parseHTML("<th class=\"gameboard-cornerMarker\">" + letters.charAt(i) + "</th>")));
        } else {
            thead.append($($.parseHTML("<th class=\"gameboard-horiMarker\">" + letters.charAt(i) + "</th>")));
        }
    }
    var tbody = $($.parseHTML("<tbody></tbody>"));
    for (var numbers = 0; numbers < 10; numbers++) {
        var output = $($.parseHTML("<tr></tr>"));
        for (var letter = 0; letter < letters.length; letter++) {
            var charAt = letters.charAt(letter);
            var row;
            if (charAt == ' ') {
                row = $($.parseHTML("<th class=\"gameboard-vertMarker\">" + (numbers + 1) + "</th>"));
            } else {
                row = $($.parseHTML("<td class=\"gameboard-cell\" id=\"" + ((numbers + 1) + charAt) + "\"></td>"));
                row.click(this.onCellClicked);
            }
            output.append(row);
        }
        tbody.append(output);
    }
    table.append(thead);
    table.append(tbody);
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
        this.currentTurn = 0;
    }
    begin() {
        this.phase = new SetupPhase(this);
        document.addEventListener('keydown', this.phase.onKeyPress);
    }
    onCellClicked(id) {
        this.phase.onCellClicked(id);
    }
}

class Phase {
    constructor() { }
    onKeyPress(event) { };
    onCellClicked(id) { };
    finishPhase() { };
}
class SetupPhase {
    constructor() {
        this.lastPressedKey = "10";
        this.keyTracker = {};
        this.keyTracker["F"] = 1;
        this.keyTracker["B"] = 6;
        this.keyTracker["1"] = 1;//The Spy
        this.keyTracker["2"] = 8;//The scout
        this.keyTracker["3"] = 5;//The Miner
        this.keyTracker["4"] = 4;//Sergeant
        this.keyTracker["5"] = 4;//Lieutenant
        this.keyTracker["6"] = 4;//Captain
        this.keyTracker["7"] = 3;//Major
        this.keyTracker["8"] = 2;//Colonel
        this.keyTracker["9"] = 1;//General
        this.keyTracker["10"] = 1;//Marshal
        this.createInfoSection();
    }
    onKeyPress(event) {
        if (event.key == "B" || event.key == "F") {
            game.phase.lastPressedKey = event.key
        } else {
            var value = parseInt(event.key);
            if (value >= 0 && value <= 9) {
                game.phase.lastPressedKey = (value == 0) ? "10" : ("" + value);
            }
        }
    }
    onCellClicked(id) {
        if (this.lastPressedKey != null && this.canPlace(this.lastPressedKey, id) == true) {
            $("#" + id).html(this.lastPressedKey);
            this.updateInfoSection();
        }
    }
    canPlace(key, cell) {
        //The player clicks on a cell that is empty. Check if they have enough of that piece left to place, if so add the piece

        //The player is clicking on an already existing piece, add back another of the removed piece to the reserve and remove the 
        var existingKey = $("#" + cell).html();
        console.log(existingKey);
        if (existingKey == "" && this.keyTracker[key] > 0) {
            this.keyTracker[key] = this.keyTracker[key] - 1;
            $("#" + cell).html(key);
            return true;
        } else if (existingKey != null && existingKey != key) {

            if (this.keyTracker[key] > 0) {

                this.keyTracker[existingKey] = this.keyTracker[existingKey] + 1;
                this.keyTracker[key] = this.keyTracker[key] - 1;
                $("#" + cell).html(key);
                return true;
            }
        }
        return false;
    }
    createInfoSection() {
        var tbody =  $("#info-table");
        var tr1 = $($.parseHTML("<tr></tr>"));
        var tr2 = $($.parseHTML("<tr id=\"info-row2\"></tr>"));
        for(var i in this.keyTracker) {

            tr1.append($($.parseHTML("<th>" + i + "</th>")));
            tr2.append($($.parseHTML("<td>" + this.keyTracker[i] + "</td>")));
        }
        tbody.append(tr1);
        tbody.append(tr2);
    }
    updateInfoSection() {

        var row =  $("#info-row2");
        row.html("");
        for(var i in this.keyTracker) {
            row.append($($.parseHTML("<td>" + this.keyTracker[i] + "</td>")));
        }
    }
    finishPhase() {
        //Transition the info section to whatever the PlayPhase needs
        game.phase = new PlayPhase(this);
    }
}
class PlayPhase {
    constructor() {
        this.selectedSquare = null;
    }

    onCellClicked(id) {
        if (this.selectedSquare == null) {
            this.selectedSquare = id;
        } else if (this.selectedSquare != id) {

            if (canMoveTo(this.selectedSquare, id)) {
                move(this.selectedSquare, id)
                this.selectedSquare = null;
                aiTurn();
            }
        }
    }
    canMoveTo(startCell, endCell) {
        return true;
    }
    canMoveTo(startCell, endCell) {

    }
    aiTurn() {

    }
    finishPhase() {
        game.phase = new PlayPhase(this);
    }
}
$(document).ready(function () {
    createGameBoard();
    startGame();
});
12