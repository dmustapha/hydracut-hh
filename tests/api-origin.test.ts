import { describe, expect, it } from "vitest";
import { POST } from "../src/app/api/[...path]/route";

describe("public reverse-proxy mutation origin", () => {
  it("accepts the public origin reconstructed from forwarded scheme and host", async () => {
    const request = new Request("http://web:3000/api/imports", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "hydracut.example.test",
        "x-forwarded-proto": "https",
        origin: "https://hydracut.example.test",
        "idempotency-key": "origin-regression-test",
      },
      body: "{}",
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ["imports"] }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: "INVALID_INPUT" });
  });
});
