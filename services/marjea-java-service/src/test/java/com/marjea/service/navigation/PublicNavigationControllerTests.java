package com.marjea.service.navigation;

import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class PublicNavigationControllerTests {

    private final PublicNavigationController controller =
            new PublicNavigationController();

    @Test
    void navigationMustNotBeEmpty() {
        var items = controller.getNavigation();

        assertFalse(items.isEmpty());
    }

    @Test
    void navigationMustContainValidPaths() {
        var items = controller.getNavigation();

        for (var item : items) {
            assertNotNull(item.href());
            assertTrue(item.href().startsWith("/"));
            assertFalse(item.href().contains("#"));
        }
    }

    @Test
    void navigationMustNotContainDuplicateIds() {
        var items = controller.getNavigation();

        Set<String> ids = items.stream()
                .map(PublicNavigationController.NavigationItem::id)
                .collect(Collectors.toSet());

        assertEquals(items.size(), ids.size());
    }

    @Test
    void navigationMustHaveArabicAndEnglishLabels() {
        var items = controller.getNavigation();

        for (var item : items) {
            assertFalse(item.labelAr().isBlank());
            assertFalse(item.labelEn().isBlank());
        }
    }
}
