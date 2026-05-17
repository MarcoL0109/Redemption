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
    // 1. Create a promise controller we can resolve whenever we want
    let resolveNetworkRequest: () => void = () => {};
    const networkLock = new Promise<void>((resolve) => {
      resolveNetworkRequest = resolve;
    });

    // 2. Intercept the login endpoint
    await page.route('**/users/login', async (route) => {
      if (route.request().method() === 'POST') {
        console.log("Intercepting login request...");
        
        // 💡 Wait here until the main test block tells us to proceed
        await networkLock;
        
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

    // 3. Trigger your login action (click the submit button, fill inputs, etc.)
    // Note: If this action waits for navigation, use page.click() without an await 
    // or wrap it carefully so it doesn't block your assertions.
    await page.locator('.email_form_inputs').fill('agent.smith@matrix.io');
    await page.locator('.password_form_inputs').fill('password123');
    await page.locator('.SignInButton').click();

    // 4. Check your UI state while the network request is GUARANTEED to be stuck hanging
    const submitButton = page.locator('.SignInButton');
    await expect(submitButton).toBeDisabled();

    // 5. Clean up: Release the lock so the network request completes and the test can exit cleanly
    resolveNetworkRequest();
});

});