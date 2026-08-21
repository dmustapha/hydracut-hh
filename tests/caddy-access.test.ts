import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const caddyfile = readFileSync(new URL("../Caddyfile", import.meta.url), "utf8");

describe("public judge access policy", () => {
  it("allows reads while requiring the operator bearer for every POST", () => {
    expect(caddyfile).toMatch(
      /@unauthorized\s*\{\s*method POST\s*not header Authorization "Bearer \{\$APP_OPERATOR_TOKEN\}"\s*\}/s,
    );
    expect(caddyfile).not.toMatch(
      /@unauthorized not header Authorization/,
    );
    expect(caddyfile).toContain("@unsupported method DELETE PUT PATCH");
  });
});
