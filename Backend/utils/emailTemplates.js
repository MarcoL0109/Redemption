const getValidationCodeTemplate = (reset_code) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }
                .email-container {
                    max-width: 550px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e1e4e8;
                }
                .email-body {
                    padding: 40px 32px 32px 32px;
                    color: #333333;
                }
                h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-top: 0;
                    margin-bottom: 16px;
                    text-align: center;
                }
                p {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #4a5568;
                    margin-top: 0;
                    margin-bottom: 24px;
                }
                .code-container {
                    text-align: center;
                    margin: 32px 0;
                }
                .validation-code {
                    display: inline-block;
                    background-color: #f1f5f9;
                    color: #1e293b;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 6px;
                    padding: 16px 32px;
                    border-radius: 8px;
                    border: 1px solid #cbd5e1;
                }
                .expiry-note {
                    font-size: 13px;
                    color: #718096;
                    text-align: center;
                    margin-top: 32px;
                    background-color: #faf5ff; /* Light purple tint for alert state */
                    padding: 12px;
                    border-radius: 6px;
                    border: 1px dashed #d8b4fe;
                }
                .email-footer {
                    background-color: #f8fafc;
                    padding: 24px;
                    text-align: center;
                    font-size: 12px;
                    color: #a0aec0;
                    border-top: 1px solid #e2e8f0;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-body">
                    <h1>Password Reset Request</h1>
                    <p>We received a request to reset your password. Use the verification code below to proceed with your security setup:</p>
                    
                    <div class="code-container">
                        <span class="validation-code">${reset_code}</span>
                    </div>

                    <div class="expiry-note">
                        ⏱️ This security code expires in <strong>10 minutes</strong> and can only be verified <strong>once</strong>.
                    </div>
                </div>

                <div class="email-footer">
                    <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                        If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #a0aec0;">
                        &copy; 2026 Redemption All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `
}



const getAccountActivationEmailTemplate = (activation_url) => {
    return `

        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Activate Your Account</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background-color: #f4f6f8;
                        margin: 0;
                        padding: 0;
                        -webkit-font-smoothing: antialiased;
                    }
                    .email-container {
                        max-width: 550px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                        border: 1px solid #e1e4e8;
                    }
                    .email-body {
                        padding: 40px 32px 32px 32px;
                        color: #333333;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 700;
                        color: #1a1a1a;
                        margin-top: 0;
                        margin-bottom: 16px;
                        text-align: center;
                    }
                    p {
                        font-size: 16px;
                        line-height: 1.6;
                        color: #4a5568;
                        margin-top: 0;
                        margin-bottom: 24px;
                    }
                    .button-container {
                        text-align: center;
                        margin: 32px 0;
                    }
                    .cta-button {
                        display: inline-block;
                        background-color: #2563eb; /* Modern royal blue */
                        color: #ffffff !important;
                        text-decoration: none;
                        padding: 14px 28px;
                        font-size: 16px;
                        font-weight: 600;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                        transition: background-color 0.2s ease;
                    }
                    .expiry-note {
                        font-size: 13px;
                        color: #718096;
                        text-align: center;
                        margin-top: 32px;
                        background-color: #f8fafc;
                        padding: 12px;
                        border-radius: 6px;
                        border: 1px dashed #e2e8f0;
                    }
                    .email-footer {
                        background-color: #f8fafc;
                        padding: 24px;
                        text-align: center;
                        font-size: 12px;
                        color: #a0aec0;
                        border-top: 1px solid #e2e8f0;
                    }
                    /* Fix for link color normalization in email clients */
                    a { color: #2563eb; }
                </style>
            </head>
            <body>

                <div class="email-container">
                    <div class="email-body">
                        <h1>Account Activation</h1>
                        <p>Thank you for signing up! Click the button below to verify your email address and fully activate your account.</p>
                        
                        <div class="button-container">
                            <a href="${activation_url}" class="cta-button" target="_blank">Activate Account</a>
                        </div>

                        <div class="expiry-note">
                            ⏱️ For security purposes, this activation link will expire in <strong>1 hour</strong>.
                        </div>
                    </div>

                    <div class="email-footer">
                        <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                            If you did not create an account, you can safely ignore this email.
                        </p>
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #a0aec0;">
                            &copy; 2026 Redemption All rights reserved.
                        </p>
                    </div>
                </div>

            </body>
        </html>
    `
}

module.exports = {getValidationCodeTemplate, getAccountActivationEmailTemplate};