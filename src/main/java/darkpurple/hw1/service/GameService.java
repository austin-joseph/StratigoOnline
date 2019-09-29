/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.service;

import darkpurple.hw1.entity.Game;
import darkpurple.hw1.entity.User;
import darkpurple.hw1.repository.GameRepository;
import darkpurple.hw1.repository.UserRepository;
import java.util.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

/**
 *
 * @author edmundliang
 */
public class GameService {
   
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GameRepository gameRepository;
    
    public Game createNewGame(User player) {
        Game game = new Game();
        game.setPlayer(player);
        game.setDateCreated(new Date());
        gameRepository.save(game);

        return game;
    }
    
    
    public Game getGame(String id) {
        return gameRepository.findByNumber(id);
    }
}
