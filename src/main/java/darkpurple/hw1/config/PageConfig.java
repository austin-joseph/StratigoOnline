package darkpurple.hw1.config;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
        import org.springframework.context.annotation.Bean;
        import org.springframework.context.annotation.Configuration;
        import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
        import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
        import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class PageConfig implements WebMvcConfigurer {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        return bCryptPasswordEncoder;
    }
    

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/home").setViewName("forward:home.html");
//        registry.addViewController("/").setViewName("forward:info.html");
//        registry.addViewController("/dashboard").setViewName("forward:dashboard.html");
        registry.addViewController("/login").setViewName("forward:login.html");
        registry.addViewController("/gameboard").setViewName("forward:/gameboard/gameboard.html");
    }

}
