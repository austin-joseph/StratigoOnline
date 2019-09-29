package darkpurple.hw1.controller;

import darkpurple.hw1.entity.User;
import darkpurple.hw1.service.CustomUserDetailsService;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import darkpurple.hw1.repository.GameInfoRepository;

@Controller
public class LoginController {

    @Autowired
    protected CustomUserDetailsService userService;
    



    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public ModelAndView login() {
        
        //CHECK IF USER IS ALREADY LOGGED IN IF SO REDIRECT TO PLAYER PAGE
	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        ModelAndView modelAndView = new ModelAndView();
        
        if (!(auth instanceof AnonymousAuthenticationToken)) {
            return new ModelAndView("redirect:/player");
        } else {
            modelAndView.setViewName("login");
        }
        
        return modelAndView;
    }
    @RequestMapping(value = "/signup", method = RequestMethod.GET)
    public ModelAndView signup() {
        ModelAndView modelAndView = new ModelAndView();
        User user = new User();
        modelAndView.addObject("user", user);
        modelAndView.setViewName("signup");
        return modelAndView;
    }
    @RequestMapping(value = "/signup", method = RequestMethod.POST)
    public ModelAndView createNewUser(@Valid User user, BindingResult bindingResult) {
	ModelAndView modelAndView = new ModelAndView();
	User userExists = userService.findUserByEmail(user.getEmail());
	if (userExists != null) {
	    bindingResult
		    .rejectValue("email", "error.user",
			    "There is already a user registered with the username provided");
	}
	if (bindingResult.hasErrors()) {
	    modelAndView.setViewName("signup");
	} else {
	    userService.saveUser(user);
	    modelAndView.addObject("successMessage", "User has been registered successfully");
	    modelAndView.addObject("user", new User());
	    modelAndView.setViewName("login");

	}
	return modelAndView;
    }

    @RequestMapping(value = "/player", method = RequestMethod.GET)
    public ModelAndView dashboard() {
	ModelAndView modelAndView = new ModelAndView();
	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
	User user = userService.findUserByEmail(auth.getName());
	modelAndView.addObject("currentUser", user);
	modelAndView.addObject("email", "Welcome " + user.getEmail());
	modelAndView.addObject("adminMessage", "Content Available Only for Users with Admin Role");
	modelAndView.setViewName("player");
	return modelAndView;
    }
    
    @RequestMapping(value="/logout", method = RequestMethod.GET)
    public String logoutPage (HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null){   
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        return "redirect:/login?logout=true";
    }

    @RequestMapping(value = {"/"}, method = RequestMethod.GET)
    public ModelAndView home() {
        ModelAndView modelAndView = new ModelAndView();
	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
	if (!(auth instanceof AnonymousAuthenticationToken)) {
	    modelAndView.setViewName("homeloggedin");
	} else {
            modelAndView.setViewName("home");
	    
        }
        return modelAndView;
    }
}
