package militaryboardgame.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.*;

@Document(collection = "games1")
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
