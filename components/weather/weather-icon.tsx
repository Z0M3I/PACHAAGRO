import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";
import { weatherIconKey } from "@/services/weather/conditions";
import { cn } from "@/lib/utils";

const iconMap = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  fog: CloudFog,
} as const;

export function WeatherIcon({
  code,
  className,
}: {
  code: number;
  className?: string;
}) {
  const key = weatherIconKey(code) as keyof typeof iconMap;
  const Icon = iconMap[key] ?? Cloud;
  return <Icon className={cn("h-8 w-8", className)} aria-hidden />;
}
