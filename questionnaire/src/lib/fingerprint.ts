import { DeviceInfo } from "@/lib/audit";

const DEVICE_ID_KEY = "hala-krasovska-device-id";

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceFingerprint(): DeviceInfo {
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };

  return {
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    deviceId: getOrCreateDeviceId(),
    colorDepth: screen.colorDepth,
    touchPoints: navigator.maxTouchPoints,
    connection: nav.connection?.effectiveType,
  };
}
