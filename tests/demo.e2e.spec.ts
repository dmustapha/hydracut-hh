import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { canonicalDigest } from "../src/domain/canonical";
import { listReceipts } from "../src/db/repository";

interface DemoFixture { incidentKey: string; planKey: string; portfolioKey: string; receiptDigest: string; repositories: string[] }

let fixture: DemoFixture;

test.beforeAll(async () => {
  const stored = (await listReceipts()).find((row) => row.resultState === "VERIFIED_WITHIN_BOUNDS");
  if (!stored) throw new Error("VERIFIED_DEMO_RECEIPT_REQUIRED");
  const receipt = stored.receipt;
  fixture = { incidentKey: receipt.incidentKey, planKey: receipt.plan.key, portfolioKey: receipt.portfolioKey, receiptDigest: canonicalDigest(receipt), repositories: receipt.inputs.map((input) => input.repository) };
});

test.afterEach(async ({ page }) => {
  const violations = (await new AxeBuilder({ page }).analyze()).violations.filter((item) => item.impact === "serious" || item.impact === "critical");
  expect(violations).toEqual([]);
});

test("F01 opens the action-first incident queue", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/incidents?role=appsec");
  await expect(page.getByRole("heading", { name: "What requires action now?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GHSA-xvch-5gv4-984h/ }).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "docs/evidence/screenshots/incidents-desktop.png" });
});

test("F02 shows immutable repository identities", async ({ page }) => {
  await page.goto(`/portfolio?portfolio=${fixture.portfolioKey}&role=appsec`);
  for (const repository of fixture.repositories) await expect(page.getByRole("heading", { name: repository }).first()).toBeVisible();
  await expect(page.getByText(fixture.receiptDigest)).toHaveCount(0);
  await page.goto("/system?role=appsec");
  await expect(page.getByRole("heading", { name: "System" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "HydraDB OSS" })).toBeVisible();
  await expect(page.getByText("Single operator; graph ports private")).toBeVisible();
});

test("F03 shows the CampaignRadius baseline and native evidence", async ({ page }) => {
  await page.goto(`/incidents/${fixture.incidentKey}/impact?role=appsec`);
  await expect(page.getByRole("heading", { name: "Portfolio impact", level: 1 })).toBeVisible();
  await expect(page.getByText("3", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/CALL algo.MSpaths/)).toBeAttached();
});

test("F04 shows only real proposed-fix outcomes", async ({ page }) => {
  await page.goto(`/incidents/${fixture.incidentKey}/proposed-fixes?role=appsec`);
  await expect(page.getByRole("heading", { name: "Proposed fixes", level: 1 })).toBeVisible();
  for (const repository of fixture.repositories) await expect(page.getByRole("heading", { name: repository }).first()).toBeVisible();
});

test("F05 creates a bounded coverage plan", async ({ page }) => {
  await page.goto(`/incidents/${fixture.incidentKey}/plan?role=appsec`);
  await expect(page.getByRole("checkbox").first()).toBeVisible();
  for (const checkbox of await page.getByRole("checkbox").all()) if (await checkbox.isEnabled()) await checkbox.check();
  const responsePromise = page.waitForResponse((response) => response.request().method() === "POST" && response.url().endsWith(`/incidents/${fixture.incidentKey}/plans`));
  await page.getByRole("button", { name: "Create bounded plan" }).click();
  expect((await responsePromise).status()).toBe(201);
  await expect(page.getByRole("link", { name: "Verify combined plan" })).toBeVisible({ timeout: 30_000 });
});

test("F06 runs one fresh combined HydraDB proof", async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto(`/plans/${fixture.planKey}/verify?role=appsec`);
  await page.getByRole("button", { name: "Run final HydraDB proof" }).click();
  await expect(page.getByRole("link", { name: "Open immutable receipt" })).toBeVisible({ timeout: 180_000 });
});

test("F07 renders and exports the canonical receipt", async ({ page }) => {
  await page.goto(`/proof/${fixture.receiptDigest}?role=appsec`);
  await expect(page.getByText(fixture.receiptDigest)).toBeVisible();
  await expect(page.getByRole("link", { name: "Download receipt.json" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download results.sarif" })).toBeVisible();
});

test("F08 changes role projection without losing context", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const url = `/incidents/${fixture.incidentKey}/impact?role=appsec&application=nodekb`;
  await page.goto(url);
  const appsecUrl = page.url();
  await page.getByRole("button", { name: "Leader" }).click();
  await expect(page.getByText(/Leader view/)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`incidents/${fixture.incidentKey}/impact.*application=nodekb.*role=leader|incidents/${fixture.incidentKey}/impact.*role=leader.*application=nodekb`));
  const leaderUrl = page.url();
  await page.goBack();
  await expect(page).toHaveURL(appsecUrl);
  await page.goForward();
  await expect(page).toHaveURL(leaderUrl);
  await page.keyboard.press("Shift+Tab");
  await page.getByRole("button", { name: "Developer" }).click();
  await expect(page.getByText(/Developer view · nodekb/)).toBeVisible();
  await page.goto(`/proof/${fixture.receiptDigest}?role=developer`);
  await page.screenshot({ path: "docs/evidence/screenshots/proof-mobile.png", fullPage: true });
});

test("refuses offline job data and a missing receipt", async ({ page }) => {
  await page.route("**/api/jobs/**", async (route) => route.abort("internetdisconnected"));
  await page.goto("/jobs/offline-fixture?role=appsec");
  await expect(page.getByText("Job status is unavailable.", { exact: true })).toBeVisible();
  await page.unroute("**/api/jobs/**");
  await page.goto(`/proof/${"0".repeat(64)}?role=appsec`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  await expect(page.getByText("VERIFIED_WITHIN_BOUNDS", { exact: true })).toHaveCount(0);
});
