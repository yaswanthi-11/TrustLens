package com.trustlensx.dto;

import lombok.*;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private String username;
    private String email;
    private Set<String> roles;
    private String message;
}
