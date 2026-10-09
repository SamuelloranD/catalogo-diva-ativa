import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Favicon branding", () => {
  it("uses the supplied dumbbell image as the browser favicon", () => {
    const rootRoute = fs.readFileSync(path.resolve(process.cwd(), "src/routes/__root.tsx"), "utf8");
    const faviconPath = path.resolve(process.cwd(), "public/diva-fav.jpg");

    expect(rootRoute).toContain('href: "/diva-fav.jpg"');
    expect(fs.existsSync(faviconPath)).toBe(true);
  });
});
