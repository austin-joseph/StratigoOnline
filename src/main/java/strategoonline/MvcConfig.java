package strategoonline;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/home").setViewName("home");
        registry.addViewController("/").setViewName("home");
        registry.addViewController("/player").setViewName("player");
        registry.addViewController("/login").setViewName("login");
        registry.addViewController("/gameboard").setViewName("gameboard");
        registry.addViewController("/pastgames").setViewName("pastgames");
    }

}