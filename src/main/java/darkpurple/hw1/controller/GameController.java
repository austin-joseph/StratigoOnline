/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.controller;

<<<<<<< HEAD
import org.springframework.stereotype.Controller;

/**
 *
 * @author edmundliang
 */

@Controller
public class GameController {
    
=======
/**
 *
 * @author anilramsoomye
 * 
 */
import darkpurple.hw1.entity.GameInfo;
import darkpurple.hw1.entity.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import darkpurple.hw1.service.CustomUserDetailsService;
import darkpurple.hw1.repository.GameInfoRepository;



@RestController
public class GameController {
    
    @Autowired
    private GameInfoRepository gameInfoRepository;
    
    @Autowired
    protected CustomUserDetailsService userService;
    
    @RequestMapping(value = "/gameboard", method = RequestMethod.POST)
    public GameInfo createGame(String player1, String player2, String jsonText) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findUserByEmail(auth.getName());
        GameInfo info = new GameInfo();
        info.setPlayer1(user.getEmail());
        info.setPlayer2(player2);
        info.setJsonBody(jsonText);
                
        gameInfoRepository.save(info);
        
        return info;
        
        
    }

>>>>>>> 45465fb5c00ed1ad96f8db0d817e5b4ed94241dd
    
    
}
