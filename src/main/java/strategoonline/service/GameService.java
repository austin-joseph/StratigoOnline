/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package strategoonline.service;

import strategoonline.entity.Game;
import strategoonline.entity.User;
import strategoonline.repository.GameRepository;
import strategoonline.repository.UserRepository;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author edmundliang
 */
@Service
public class GameService {
   
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GameRepository gameRepository;
    
    public Game createNewGame(String player) {
        Game game = new Game();
        game.setPlayer(player);
        game.setDate(new Date());
        gameRepository.save(game);

        return game;
    }
    

    public List<Game> getPlayerGames(User player) {
        return gameRepository.findAll().stream().filter(game -> game.getPlayer().equals(player.getEmail())).collect(Collectors.toList());
    }
    
    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }
    
    public Game getGame(String id) {
        return gameRepository.findBygameID(id);
    }
    
    public Game addGame(String user, String json) {
        Game game = new Game();
        game.setPlayer(user);
        game.setJsonBody(json);
        game.setDate(new Date());
        gameRepository.save(game);
        return game;
    }
}
