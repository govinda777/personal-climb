import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("que eu abro a URL base do projeto", async function () {
  // Assuming the dev server is running on localhost:3000
  await this.page.goto("http://localhost:3000");
});

Then("a página deve carregar completamente para o snapshot", async function () {
  // Wait for the page to reach a stable state before the AfterStep hook takes a screenshot
  await this.page.waitForLoadState("networkidle");
});
