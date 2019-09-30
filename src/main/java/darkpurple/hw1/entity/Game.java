/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.entity;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.*;

import org.springframework.data.mongodb.core.index.IndexDirection;
import org.springframework.data.mongodb.core.index.Indexed;

/**
 *
 * @author anilramsoomye
 */

@Document (collection = "games1")
public class Game {
    
    @Id
    private String gameID;
    
    private String player;
    
    private Date date;
    
    private String jsonBody; // winner, boardStates, moves

    public String getGameID() {
        return gameID;
    }

    public void setGameID(String gameID) {
        this.gameID = gameID;
    }

    

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
    
  

   


    public String getPlayer() {
        return player;
    
    }
    
    public Date getDateCreated() {
        return date;
    }

   


   

    
    public void setPlayer(String player) {
        this.player = player;
    }

   


    
 
    public void setJsonBody(String jsonBody2) {
        this.jsonBody = jsonBody2;
    }
    
    public String getJsonBody() {
        return jsonBody;
    }
    
    
    
}
