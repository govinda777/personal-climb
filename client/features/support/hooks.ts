import {
  BeforeAll,
  Before,
  After,
  AfterStep,
  setWorldConstructor,
} from "@cucumber/cucumber";
import { chromium, Browser, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Define custom world to hold browser and page instances
class CustomWorld {
  browser?: Browser;
  page?: Page;
}

setWorldConstructor(CustomWorld);

const snapshotDir = path.join(process.cwd(), "docs", "last-commit-snapshots");

BeforeAll(async function () {
  // Clear the snapshots directory before running tests
  if (fs.existsSync(snapshotDir)) {
    fs.rmSync(snapshotDir, { recursive: true, force: true });
  }
  fs.mkdirSync(snapshotDir, { recursive: true });
});

Before(async function () {
  // Launch browser and create a new page context for each scenario
  this.browser = await chromium.launch({ headless: true });
  this.page = await this.browser.newPage();
});

AfterStep(async function ({ pickle, pickleStep, result }) {
  // Take a full page screenshot after every successful step
  if (result.status === "PASSED" && this.page) {
    // Sanitize feature name and step index for filename
    const featureName = pickle.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    // Find the step index (Cucumber doesn't easily expose the raw index in this hook, so we estimate based on the step id)
    // Alternatively, we can use a counter per scenario.
    if (!this.stepIndex) {
      this.stepIndex = 1;
    } else {
      this.stepIndex++;
    }

    const fileName = `${featureName}-step-${this.stepIndex}.png`;
    const filePath = path.join(snapshotDir, fileName);

    await this.page.screenshot({ path: filePath, fullPage: true });
  }
});

After(async function () {
  // Close the browser after the scenario finishes
  if (this.page) {
    await this.page.close();
  }
  if (this.browser) {
    await this.browser.close();
  }
});
