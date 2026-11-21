import { describe, expect, it } from "vitest";
import { announcementMatchesUser } from "@/lib/announcements-audience";

const user = {
  departmentId: "dep-la-paz",
  municipalityId: "mun-patacamaya",
  communityId: "com-aroma",
  cropIds: ["crop-papa", "crop-quinua"],
};

function announce(
  overrides: Partial<Parameters<typeof announcementMatchesUser>[0]>,
) {
  return {
    audienceScope: "national" as const,
    departmentId: null,
    municipalityId: null,
    communityId: null,
    cropId: null,
    ...overrides,
  };
}

describe("segmentación de anuncios", () => {
  it("los avisos nacionales llegan a todos", () => {
    expect(announcementMatchesUser(announce({}), user)).toBe(true);
  });

  it("respeta el alcance departamental", () => {
    expect(
      announcementMatchesUser(
        announce({ audienceScope: "department", departmentId: "dep-la-paz" }),
        user,
      ),
    ).toBe(true);
    expect(
      announcementMatchesUser(
        announce({
          audienceScope: "department",
          departmentId: "dep-cochabamba",
        }),
        user,
      ),
    ).toBe(false);
  });

  it("respeta municipio y comunidad", () => {
    expect(
      announcementMatchesUser(
        announce({
          audienceScope: "municipality",
          municipalityId: "mun-patacamaya",
        }),
        user,
      ),
    ).toBe(true);
    expect(
      announcementMatchesUser(
        announce({ audienceScope: "community", communityId: "com-otra" }),
        user,
      ),
    ).toBe(false);
  });

  it("segmenta por cultivos de interés", () => {
    expect(
      announcementMatchesUser(
        announce({ audienceScope: "crop", cropId: "crop-papa" }),
        user,
      ),
    ).toBe(true);
    expect(
      announcementMatchesUser(
        announce({ audienceScope: "crop", cropId: "crop-cafe" }),
        user,
      ),
    ).toBe(false);
  });

  it("no filtra datos incompletos como coincidencia positiva", () => {
    expect(
      announcementMatchesUser(
        announce({ audienceScope: "department", departmentId: null }),
        user,
      ),
    ).toBe(false);
  });
});
