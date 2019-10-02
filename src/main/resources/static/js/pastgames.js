/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function() {

    $.ajax({
        url: "/getgames",
        type: "POST",
        dataType: "json",
        success: function(data) {
            games = data;

            for (var i = 0; i < games.length; i++) {
                var date = new Date(games[i].date*1000);
                var winner = JSON.parse(games[i].jsonBody).winner;
                var userPiecesLost = JSON.parse(games[i].jsonBody).userPiecesLost;
                var aiPiecesLost = JSON.parse(games[i].jsonBody).aiPiecesLost;

                if (winner == 1) {
                    $('#tbody-games-list').prepend('<tr><td>'+date+'</td><td>You Won</td></tr>');
                }
                else {
                    $('#tbody-games-list').prepend('<tr><td>'+date+'</td><td>AI Won</td></tr>');
                }

                $('#tbody-lost-list').prepend('<tr><td style="color: #0062cc;">'+userPiecesLost+'</td><td style="color: red;">'+aiPiecesLost+'</td></tr>');

            }
        }
    });



});

