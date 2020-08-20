package militaryboardgame.repository;

import militaryboardgame.entity.Game;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GameRepository extends MongoRepository<Game, String> {

    Game findBygameID(String gameID);

}
