import { describe, expect, it } from "vitest";
import {
  demoAnnouncements,
  demoCategories,
  demoCommunities,
  demoCrops,
  demoDepartments,
  demoMeetings,
  demoMunicipalities,
  demoProfiles,
  demoWeatherAlerts,
} from "@/lib/demo-data";

describe("integridad de los datos DEMO", () => {
  const departmentIds = new Set(demoDepartments.map((item) => item.id));
  const municipalityById = new Map(
    demoMunicipalities.map((item) => [item.id, item]),
  );
  const communityById = new Map(demoCommunities.map((item) => [item.id, item]));

  it("incluye los nueve departamentos de Bolivia", () => {
    expect(demoDepartments).toHaveLength(9);
    expect(new Set(demoDepartments.map((item) => item.code)).size).toBe(9);
  });

  it("cada municipio pertenece a un departamento existente", () => {
    for (const municipality of demoMunicipalities) {
      expect(departmentIds.has(municipality.departmentId)).toBe(true);
    }
  });

  it("cada comunidad pertenece a un municipio existente", () => {
    for (const community of demoCommunities) {
      expect(municipalityById.has(community.municipalityId)).toBe(true);
    }
  });

  it("los perfiles respetan la jerarquía departamento-municipio-comunidad", () => {
    for (const profile of demoProfiles) {
      if (profile.municipalityId) {
        expect(municipalityById.get(profile.municipalityId)?.departmentId).toBe(
          profile.departmentId,
        );
      }
      if (profile.communityId && profile.municipalityId) {
        expect(communityById.get(profile.communityId)?.municipalityId).toBe(
          profile.municipalityId,
        );
      }
    }
  });

  it("las reuniones respetan la jerarquía geográfica", () => {
    for (const meeting of demoMeetings) {
      if (meeting.municipalityId) {
        expect(
          municipalityById.get(meeting.municipalityId)?.departmentId,
        ).toBe(meeting.departmentId);
      }
      if (meeting.communityId) {
        expect(communityById.get(meeting.communityId)?.municipalityId).toBe(
          meeting.municipalityId,
        );
      }
    }
  });

  it("anuncios y alertas respetan la jerarquía geográfica", () => {
    for (const item of [...demoAnnouncements, ...demoWeatherAlerts]) {
      if (item.municipalityId) {
        expect(municipalityById.get(item.municipalityId)?.departmentId).toBe(
          item.departmentId,
        );
      }
      if ("communityId" in item && item.communityId) {
        expect(communityById.get(item.communityId)?.municipalityId).toBe(
          item.municipalityId,
        );
      }
    }
  });

  it("no repite identificadores", () => {
    const ids = [
      ...demoDepartments,
      ...demoMunicipalities,
      ...demoCommunities,
      ...demoCrops,
      ...demoCategories,
      ...demoProfiles,
    ].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("los perfiles demo cubren los cuatro roles", () => {
    expect(new Set(demoProfiles.map((profile) => profile.role))).toEqual(
      new Set(["admin", "producer", "association_manager", "content_editor"]),
    );
  });
});
