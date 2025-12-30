package com.email.writer.spring.app;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApikey;


    // Inject WebClient.Builder and build WebClient
    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }



    public String generateEmailReply(EmailRequest emailRequest){
        //building a prompt
        String prompt=buildPrompt(emailRequest);

        //crafting a request

        Map<String,Object> requestBody=Map.of(
            "contents",new Object[]{
                    Map.of(
                            "parts",new Object[]{
                                    Map.of("text",prompt)
                            }
                    )
                }
        );
        //doing the request and get response

        String response =webClient.post()
                .uri(geminiApiUrl)
                .header("Content-Type","application/json")
                .header("X-goog-api-key",geminiApikey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        //extracting + returning the response
        return extractReturnResponse(response);
    }

    private String extractReturnResponse(String response) {
        try{
            // Create ObjectMapper instance (Jackson's core class for JSON processing)
            ObjectMapper mapper = new ObjectMapper();

// Parse the JSON response string into a JsonNode tree structure
// This converts raw JSON into a navigable in-memory representation
            JsonNode rootNode = mapper.readTree(response);

// rootNode now represents the top-level JSON object or array
// You can access fields using:
// rootNode.get("key")       → direct access (may return null)
// rootNode.path("key")      → safe access (no NullPointerException)

// Example usage:
// String name = rootNode.get("name").asText();
// int age = rootNode.path("age").asInt();

            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asString();
        }
        catch (Exception e){
            return "Error processing request " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt=new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please don't create a subject line");
        if(emailRequest.getTone()!=null && !emailRequest.getTone().isEmpty()){
            prompt.append("Use a ").append(emailRequest.getTone()).append("tone.");
        }
        prompt.append("\nOriginal email content: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }

}
