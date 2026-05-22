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


  test("should direct users that are successfully login to the homepage", async ({ page }) => {
    await page.locator('.email_form_inputs').fill('marcolau733@gmail.com');
    await page.locator('.password_form_inputs').fill('6609lau0093');
    await page.locator('.SignInButton').click();
    await expect(page).toHaveURL(/.*\/Home/);
  })

  // This account is indeed disabled in the sample data -> loading script is set to 0 for this account
  test('should display shaking error message due to account not activated', async ({ page }) => {
    await page.locator('.email_form_inputs').fill('test@gmail.com');
    await page.locator('.password_form_inputs').fill('1234');
    await page.locator('.SignInButton').click();
    const errorMessage = page.locator('.ErrorMessage.anim-shake');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Account Not Activated');
  })

  test('should reject user from going to the homepage before signing in', async ({ page }) => {
    await page.goto('/Home');
    await expect(page).toHaveURL(/.*\/SignIn/);
  })

});