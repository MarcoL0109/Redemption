import { test, expect } from '@playwright/test';


test.describe('Sign In Component Layout and Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/SignIn'); 
  });


  test('should render all form elements correctly on load', async ({ page }) => {
    await expect(page.locator('.TitleText')).toHaveText('REDEMPTION');
    await expect(page.locator('.SubtitleText')).toHaveText('PROVE YOUR WORTH');

    await expect(page.locator('.email_form_inputs')).toBeVisible();
    await expect(page.locator('.password_form_inputs')).toBeVisible();
    
    await expect(page.locator('.SignInButton')).toHaveText('SIGN IN');
    await expect(page.locator('.HomeButton')).toContainText('Join Room');
  });


  test('should toggle password visibility when clicking the eye icon', async ({ page }) => {
    const passwordInput = page.locator('.password_form_inputs');
    const eyeIcon = page.locator('.EyeIcon');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await eyeIcon.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await eyeIcon.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });


  test('should display shaking error message if server rejects credentials', async ({ page }) => {
    await page.locator('.email_form_inputs').fill('wrong-agent@matrix.io');
    await page.locator('.password_form_inputs').fill('WrongPassword123');
    await page.locator('.SignInButton').click();
    const errorMessage = page.locator('.ErrorMessage.anim-shake');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Incorrect Credentials');
  });


  test('should disable submission buttons when state machine is processing parameters', async ({ page }) => {
    // Use a wildcard pattern so it matches regardless of what the base API URL is
    await page.route('**/users/login', async (route) => {
      if (route.request().method() === 'POST') {
        // 1. Deliberately hold the UI state open for 2.5 seconds
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 2. 💡 FIX: Return a fake mock payload instantly without forwarding to localhost!
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            token: 'fake-jwt-token-for-testing',
            user: { id: 1, email: 'agent.smith@matrix.io' }
          })
        });
      }
    });

    // Keep your standard form UI interactions exactly the same...
    await page.locator('.email_form_inputs').fill('agent.smith@matrix.io');
    await page.locator('.password_form_inputs').fill('CorrectHorseBatteryStaple123!');
    await page.locator('.SignInButton').click();

    const submitButton = page.locator('.SignInButton');
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('AUTHENTICATING...');
  });

});