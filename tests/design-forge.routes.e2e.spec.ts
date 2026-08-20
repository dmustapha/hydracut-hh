import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const incident = process.env.HYDRACUT_FIXTURE_INCIDENT;
const plan = process.env.HYDRACUT_FIXTURE_PLAN;
const digest = process.env.HYDRACUT_FIXTURE_DIGEST;
const job = process.env.HYDRACUT_FIXTURE_JOB;
const fixtureNames = new Set(["incident", "impact", "fixes", "plan", "verify", "receipt", "job"]);

const routes = [
  ["home", "/"], ["incidents", "/incidents"], ["graph-empty", "/graph"],
  ["portfolio", "/portfolio"], ["imports", "/imports"], ["proof", "/proof"], ["system", "/system"],
  ...(incident ? [["incident", `/incidents/${incident}`], ["impact", `/incidents/${incident}/impact`], ["fixes", `/incidents/${incident}/proposed-fixes`], ["plan", `/incidents/${incident}/plan`]] as const : []),
  ...(plan ? [["verify", `/plans/${plan}/verify`]] as const : []),
  ...(digest ? [["receipt", `/proof/${digest}`]] as const : []),
  ...(job ? [["job", `/jobs/${job}`]] as const : []),
] as const;

test.describe("Design Forge route matrix", () => {
  for (const [name, path] of routes) {
    test(`${name} renders with an accessible evidence layout`, async ({ page }, testInfo) => {
      const fixtureEnv: Record<string, string | undefined> = { incident: incident, impact: incident, fixes: incident, plan: incident, verify: plan, receipt: digest, job: job };
      test.skip(Boolean(fixtureEnv[name]) === false && fixtureNames.has(name), "This route requires its persisted fixture ID; no capture is fabricated.");
      await page.goto(path);
      await expect(page.locator("main#main")).toBeVisible();
      await expect(page.locator("main#main h1").first()).toBeVisible();
      await expect(page.locator("body")).not.toContainText("DATABASE_URL_REQUIRED");
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
      const overflow = await page.evaluate(() => {
        const viewport = document.documentElement.clientWidth;
        const scroller = (element: Element) => {
          let parent = element.parentElement;
          while (parent) {
            const overflowX = getComputedStyle(parent).overflowX;
            if (overflowX === "auto" || overflowX === "scroll") return true;
            parent = parent.parentElement;
          }
          return false;
        };
        const offenders = [...document.querySelectorAll("body *")].filter((element) => {
          if (scroller(element)) return false;
          const rect = element.getBoundingClientRect();
          return rect.left < -1 || rect.right > viewport + 1;
        }).slice(0, 12).map((element) => {
          const rect = element.getBoundingClientRect();
          return { selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}.${element.className?.toString?.().split(" ")[0] ?? ""}`, left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
        });
        return { documentWidth: document.documentElement.scrollWidth, viewport, offenders };
      });
      expect(overflow.offenders, `route must not introduce horizontal overflow: ${JSON.stringify(overflow)}`).toEqual([]);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations).toEqual([]);
      testInfo.annotations.push({ type: "viewport", description: testInfo.project.name });
      await page.screenshot({ path: `docs/evidence/design-forge/${testInfo.project.name}/${name}.png`, fullPage: true });
    });
  }
});
