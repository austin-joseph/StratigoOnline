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
            console.log(JSON.parse(games[0].jsonBody));
        }
    });

});