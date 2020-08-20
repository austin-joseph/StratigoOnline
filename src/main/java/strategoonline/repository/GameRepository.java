package strategoonline.repository;

import strategoonline.entity.Game;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GameRepository extends MongoRepository<Game, String> {

    Game findBygameID(String gameID);

}
