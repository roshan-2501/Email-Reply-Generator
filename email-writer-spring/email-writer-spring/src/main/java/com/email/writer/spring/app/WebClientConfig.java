package com.email.writer.spring.app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    // Explicitly define WebClient.Builder as a Spring bean
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
