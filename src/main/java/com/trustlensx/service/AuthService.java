package com.trustlensx.service;

import com.trustlensx.dto.AuthResponseDTO;
import com.trustlensx.dto.UserLoginDTO;
import com.trustlensx.dto.UserRegisterDTO;

public interface AuthService {
    AuthResponseDTO register(UserRegisterDTO request);
    AuthResponseDTO login(UserLoginDTO request);
    void changePassword(String username, String currentPassword, String newPassword);
}
