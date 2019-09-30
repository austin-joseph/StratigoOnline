/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.controller;

import darkpurple.hw1.entity.Game;
import darkpurple.hw1.entity.User;
import darkpurple.hw1.repository.GameRepository;
import darkpurple.hw1.service.CustomUserDetailsService;
import darkpurple.hw1.service.GameService;
import java.util.List;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

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
    
    @RequestMapping(value = "/pastgames", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Game> getPlayerGames() {
        return gameService.getPlayerGames(userService.getLoggedUser());
    }
    
    @RequestMapping(value = "/gameboard", method = RequestMethod.POST)
    public Game createGame(String jsonText) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByEmail(auth.getName());
        Game info = new Game();
        info.setPlayer(user);
        info.setJsonBody(jsonText);
                
        gameService.addGame(info);
        
        return info;
        
        
    }
    
   @RequestMapping(value = "/gameboard", method = RequestMethod.GET)
    public ModelAndView login() {
        
        ModelAndView modelAndView = new ModelAndView();
        
        modelAndView.setViewName("gameboard");
       
        
        return modelAndView;
    }
}