import { describe, expect, it } from "vitest";
import {
  demoCategories,
  demoCommunities,
  demoCrops,
  demoDepartments,
  demoMunicipalities,
  demoProfiles,
} from "@/lib/demo-data";

describe("integridad de los datos DEMO", () => {
  it("incluye los nueve departamentos de Bolivia", () => {
    expect(demoDepartments).toHaveLength(9);
    expect(new Set(demoDepartments.map((item) => item.code)).size).toBe(9);
  });

  it("cada municipio pertenece a un departamento existente", () => {
    const departmentIds = new Set(demoDepartments.map((item) => item.id));
    for (const municipality of demoMunicipalities) {
      expect(departmentIds.has(municipality.departmentId)).toBe(true);
    }
  });

  it("cada comunidad pertenece a un municipio existente", () => {
    const municipalityIds = new Set(demoMunicipalities.map((item) => item.id));
    for (const community of demoCommunities) {
      expect(municipalityIds.has(community.municipalityId)).toBe(true);
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
