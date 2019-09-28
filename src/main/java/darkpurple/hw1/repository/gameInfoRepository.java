/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package darkpurple.hw1.repository;
import darkpurple.hw1.entity.GameInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

/**
 *
 * @author anilramsoomye
 */
public interface gameInfoRepository extends MongoRepository<GameInfo, String> {
    
}
