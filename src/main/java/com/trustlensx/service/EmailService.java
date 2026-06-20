package com.trustlensx.service;

import java.util.List;

public interface EmailService {
    void sendEmailAlert(String toEmail, String url, int riskScore, String threatLevel, List<String> reasons);
}
