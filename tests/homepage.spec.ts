import { test, expect } from '@playwright/test';


test.describe('The test should cover all the operation that could be done in home page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/SignIn'); 
    });


    test("should direct user to the user profile page", async ({ page }) => {
        await page.locator('.email_form_inputs').fill('marcolau733@gmail.com');
        await page.locator('.password_form_inputs').fill('6609lau0093');
        await page.locator('.SignInButton').click();
        await page.locator('.UserIconCircle').click();
        await page.locator('.ActionButton:has-text("Profile")').click();
        await expect(page).toHaveURL(/.*\/UserProfilePage/);
    })
})