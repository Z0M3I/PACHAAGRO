import { describe, expect, it } from "vitest";
import {
  describeWeatherCode,
  weatherIconKey,
} from "@/services/weather/conditions";
import {
  formatDate,
  normalizePhone,
  slugify,
  toDateTimeLocal,
} from "@/lib/utils";
import { weatherQuerySchema } from "@/lib/validation/weather";

describe("condiciones meteorológicas", () => {
  it("traduce códigos WMO conocidos", () => {
    expect(describeWeatherCode(0)).toBe("Despejado");
    expect(describeWeatherCode(2)).toBe("Parcialmente nublado");
    expect(describeWeatherCode(61)).toBe("Lluvia");
    expect(describeWeatherCode(95)).toBe("Tormenta");
  });

  it("asigna iconos sin claves desconocidas", () => {
    expect(weatherIconKey(0)).toBe("sun");
    expect(weatherIconKey(3)).toBe("cloud-sun");
    expect(weatherIconKey(95)).toBe("storm");
    expect(weatherIconKey(999)).toBe("cloud");
  });
});

describe("utilidades", () => {
  it("normaliza teléfonos bolivianos a E.164 sin +", () => {
    expect(normalizePhone("71234567")).toBe("59171234567");
    expect(normalizePhone("+591 71234567")).toBe("59171234567");
    expect(normalizePhone("591-712-34567")).toBe("59171234567");
  });

  it("genera slugs legibles sin tildes", () => {
    expect(slugify("Cuidado del Suelo en Potosí")).toBe(
      "cuidado-del-suelo-en-potosi",
    );
  });

  it("protege el formateo de fechas inválidas", () => {
    expect(formatDate("no-es-fecha")).toBe("Sin fecha");
    expect(toDateTimeLocal(null)).toBe("");
    expect(toDateTimeLocal("2026-11-21T12:00:00.000Z")).toMatch(
      /^2026-11-21T\d{2}:\d{2}$/,
    );
  });
});

describe("consulta meteorológica", () => {
  it("valida coordenadas y municipio", () => {
    expect(
      weatherQuerySchema.safeParse({ lat: "-16.5", lon: "-68.15" }).success,
    ).toBe(true);
    expect(
      weatherQuerySchema.safeParse({ lat: "999", lon: "-68.15" }).success,
    ).toBe(false);
    expect(
      weatherQuerySchema.safeParse({ municipalityId: "abc" }).success,
    ).toBe(true);
  });
});
