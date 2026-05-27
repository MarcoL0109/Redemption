import { test, expect } from '@playwright/test';


test.describe('The test should cover all the operation that could be done in home page', () => {

    // Merge the sign in process in the beforeEach function to prevent defining the action in each test
    test.beforeEach(async ({ page }) => {
        await page.goto('/SignIn');
        await page.locator('.email_form_inputs').fill('marcolau733@gmail.com');
        await page.locator('.password_form_inputs').fill('6609lau0093');
        await page.locator('.SignInButton').click();
    });


    test("should direct user to the user profile page", async ({ page }) => {
        await page.locator('.UserIconCircle').click();
        await page.locator('.ActionButton:has-text("Profile")').click();
        await expect(page).toHaveURL(/.*\/UserProfilePage/);
    })

    
    test("should direct user to the history page", async ({ page }) => {
        await page.locator('.UserIconCircle').click();
        await page.locator('.ActionButton:has-text("History")').click();
        await expect(page).toHaveURL(/.*\/HistoryPage/);
    })


    test("should sign user out when user clicked the sign out button (should not be able to navigate back via URL", async ({ page }) => {
        await page.locator('.UserIconCircle').click();
        await page.locator('.SignOutButton:has-text("Sign Out")').click();
        await expect(page).toHaveURL(/.*\/SignIn/);
        await page.goto('/Home');
        await expect(page).toHaveURL(/.*\/SignIn/);
    })


    test("should direct user to the problem list page when clicking the problem card at the homepage", async ({ page }) => {
        await page.getByTestId('problem-set-card-12').click();
        await expect(page).toHaveURL(/.*\/ProblemList/);
    })

    
})