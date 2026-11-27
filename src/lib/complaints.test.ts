import { describe, it, expect } from "vitest";
import { demoAnalyze, makeComplaintId } from "./complaints";
describe("complaints", () => {
  it("IDs look like NV-XXXXXX", () => expect(makeComplaintId()).toMatch(/^NV-[A-Z2-9]{6}$/));
  it("detects Kannada garbage", () => expect(demoAnalyze("ಕಸ ತುಂಬಿದೆ").category).toBe("garbage"));
  it("marks danger as critical", () => expect(demoAnalyze("pothole caused accident").urgency).toBe("critical"));
});
