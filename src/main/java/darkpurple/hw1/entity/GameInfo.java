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

/**
 *
 * @author anilramsoomye
 */
@Document (collection = "gameInfo")
public class GameInfo {
    @Id
    private String gameID;
    
    private String player1; //AI so 0
    private String player2; //email of player
    
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

    public String getGameID() {
        return gameID;
    }

    public String getPlayer1() {
        return player1;
    }

    public String getPlayer2() {
        return player2;
    }

   

    public void setGameID(String gameID) {
        this.gameID = gameID;
    }

    public void setPlayer1(String player1) {
        this.player1 = player1;
    }

    public void setPlayer2(String player2) {
        this.player2 = player2;
    }
    
    public void setJsonBody(String json) {
        this.jsonBody = json;
    }
    
    
    
}
