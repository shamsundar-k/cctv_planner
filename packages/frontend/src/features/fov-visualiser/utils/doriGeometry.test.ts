import { describe, expect, it } from "vitest";
import {
  DORI_DISTANCE_CAP_METRES,
  clipDoriRegionsToDomain,
  deriveDoriOverlayGeometry,
} from "./doriGeometry";

describe("deriveDoriOverlayGeometry", () => {
  it("matches the 1920 px, 90 degree DORI reference fixture", () => {
    const geometry = deriveDoriOverlayGeometry(1920, 90);

    [3.84, 7.68, 15.36, 38.4].forEach((expectedDistance, index) => {
      expect(geometry?.boundaries[index]?.maximumDistance).toBeCloseTo(
        expectedDistance,
      );
    });
  });

  it("scales with resolution and decreases as the field of view widens", () => {
    const base = deriveDoriOverlayGeometry(1920, 60);
    const doubledResolution = deriveDoriOverlayGeometry(3840, 60);
    const widerFov = deriveDoriOverlayGeometry(1920, 90);

    expect(base).not.toBeNull();
    expect(doubledResolution).not.toBeNull();
    expect(widerFov).not.toBeNull();

    base?.boundaries.forEach((boundary, index) => {
      expect(doubledResolution?.boundaries[index]?.maximumDistance).toBeCloseTo(
        boundary.maximumDistance * 2,
      );
      expect(widerFov?.boundaries[index]?.maximumDistance).toBeLessThan(
        boundary.maximumDistance,
      );
    });
  });

  it("rejects invalid inputs and caps drawable geometry", () => {
    expect(deriveDoriOverlayGeometry(0, 90)).toBeNull();
    expect(deriveDoriOverlayGeometry(1920, 0)).toBeNull();
    expect(deriveDoriOverlayGeometry(1920, 180)).toBeNull();
    expect(deriveDoriOverlayGeometry(Number.NaN, 90)).toBeNull();

    const geometry = deriveDoriOverlayGeometry(100_000, 1);
    expect(geometry?.maxDrawableDistance).toBe(DORI_DISTANCE_CAP_METRES);
  });

  it("builds ordered, non-overlapping regions and clips them to the view", () => {
    const geometry = deriveDoriOverlayGeometry(1920, 90);
    expect(geometry).not.toBeNull();

    geometry?.regions.forEach((region, index) => {
      expect(region.endDistance).toBeGreaterThan(region.startDistance);
      if (index > 0) {
        expect(region.startDistance).toBe(
          geometry.regions[index - 1]?.endDistance,
        );
      }
    });

    const clipped = clipDoriRegionsToDomain(geometry?.regions ?? [], [5, 12]);
    expect(clipped[0]?.startDistance).toBe(5);
    expect(clipped.at(-1)?.endDistance).toBe(12);
  });
});
