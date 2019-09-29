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

/**
 *
 * @author anilramsoomye
 */

public class Game {
    
    @Id
    private String number;
    private User player;
    private Date date;
    
    private String jsonBody; // winner, boardStates, moves
    
    
   /* private LinkedList<pieceState> stateList;
    private LinkedList<move> moves;*
        
    
    public class move{
        private String startingSpot;
        private String endingSpot;
        private String piece;
        private String pieceOwner;
    }
    
    public class pieceState {
        private String startingSpot;
        private String endingSpot;
        private String pieceOwner;
                
    }*/

    public String getGameid() {
        return number;
    }

    public User getPlayer() {
        return player;
    
    }
    
    public Date getDateCreated() {
        return date;
    }

    public void setGameID(String gameid) {
        this.number = gameid;
    }

    public void setPlayer(User player) {
        this.player = player;
    }

    public void setDateCreated(Date date) {
        this.date = date;
    }
    
    
    
}
