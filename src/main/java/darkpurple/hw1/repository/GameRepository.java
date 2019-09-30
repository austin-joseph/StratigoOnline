/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.repository;
import darkpurple.hw1.entity.Game;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface GameRepository extends MongoRepository<Game, String> {
    
    Game findByNumber(String gameid);
    
}