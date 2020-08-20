/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package strategoonline.repository;
import strategoonline.entity.Game;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface GameRepository extends MongoRepository<Game, String> {
    
    Game findBygameID(String gameID);
    
}