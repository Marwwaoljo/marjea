package com.marjea.service.monitoring;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration(proxyBeanMethods = false)
@EnableScheduling
@ConditionalOnProperty(
        name = "marjea.monitoring.enabled",
        havingValue = "true")
class OfficialFeedSchedulingConfiguration {
}
