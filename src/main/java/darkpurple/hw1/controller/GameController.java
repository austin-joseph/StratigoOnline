/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.controller;

import darkpurple.hw1.entity.Game;
import darkpurple.hw1.entity.User;
import darkpurple.hw1.service.GameService;
import darkpurple.hw1.repository.GameRepository;
import darkpurple.hw1.service.CustomUserDetailsService;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author anilramsoomye
 * 
 */





@RestController
public class GameController {
    
    
    @Autowired
    private GameService gameService;
        
    @Autowired
    private CustomUserDetailsService userService;
    
    @Autowired
    HttpSession session;
    
    @RequestMapping(value = "/dashboard", method = RequestMethod.POST)
    public Game createNewGame() {

        Game game = gameService.createNewGame(userService.getLoggedUser().getEmail());
        session.setAttribute("gameId", game.getGameID());
        System.out.print("this 1");

        return game;
    }
    
    @RequestMapping(value = "/pastgames", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Game> getPlayerGames() {
        return gameService.getPlayerGames(userService.getLoggedUser());
    }
    
    @RequestMapping(value = "/recordGame", method = RequestMethod.POST)
    public Game createGame(@RequestBody String jsonText) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByEmail(auth.getName());
                
        Game game = gameService.addGame(user.getEmail(), jsonText);
        System.out.print(jsonText);
        return game;
    }
    
    @RequestMapping(value = "/pastgames", method = RequestMethod.GET)
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }

    
}

