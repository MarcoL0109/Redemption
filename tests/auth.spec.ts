import { test, expect } from '@playwright/test';

const USER_API_URL = process.env.VITE_USER_API_URL;


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
    let requestWasIntercepted = false;

    await page.route(`${USER_API_URL}/login`, async (route) => {
      if (route.request().method() === 'POST') {
        requestWasIntercepted = true;
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await page.locator('.email_form_inputs').fill('agent.smith@matrix.io');
    await page.locator('.password_form_inputs').fill('CorrectHorseBatteryStaple123!');
    await page.locator('.SignInButton').click();

    const submitButton = page.locator('.SignInButton');
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('AUTHENTICATING...');

    expect(requestWasIntercepted).toBe(true);
  });

});