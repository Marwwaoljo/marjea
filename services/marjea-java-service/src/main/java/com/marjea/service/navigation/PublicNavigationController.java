package com.marjea.service.navigation;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicNavigationController {

    public record NavigationItem(
            String id,
            String labelAr,
            String labelEn,
            String href,
            String icon) {
    }

    @GetMapping("/api/v1/public/navigation")
    public List<NavigationItem> getNavigation() {
        return List.of(
                new NavigationItem("home", "الرئيسية", "Home", "/", "House"),
                new NavigationItem("technology", "التقنية", "Technology", "/technical", "ScanSearch"),
                new NavigationItem("plans", "الاشتراكات", "Plans", "/plans", "CreditCard"),
                new NavigationItem("login", "تسجيل الدخول", "Sign In", "/sign-in", "LogIn"));
    }
}
