/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.controller;

import darkpurple.hw1.entity.Game;
import darkpurple.hw1.service.CustomUserDetailsService;
import darkpurple.hw1.service.GameService;
import java.util.List;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 *
 * @author edmundliang
 */

@Controller
public class GameController {
    
    @Autowired
    private GameService gameService;
    
    @Autowired
    private CustomUserDetailsService userService;
    
    @Autowired
    HttpSession session;
    
    @RequestMapping(value = "/dashboard", method = RequestMethod.POST)
    public Game createNewGame() {

        Game game = gameService.createNewGame(userService.getLoggedUser());
        session.setAttribute("gameId", game.getGameId());

        return game;
    }
    
    
    
    /*
    @RequestMapping(value = "/player/list", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Game> getPlayerGames() {
        return gameService.getPlayerGames(playerService.getLoggedUser());
    }*/
}