import { useEffect } from 'react';

export function useShake(onShake: () => void, threshold: number = 20) {
  useEffect(() => {
    let lastTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      // Prioritize acceleration without gravity if available, fallback to with gravity
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc) return;

      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 0;

      // Calculate magnitude of acceleration
      const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);

      // If magnitude is greater than ~18-20, it's a solid shake
      // (Gravity is 9.8, so normal movement rarely spikes past 15 unless shaken)
      if (magnitude > threshold) {
        const now = Date.now();
        if (now - lastTime > 500) { // Debounce shakes
          onShake();
          lastTime = now;
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [onShake, threshold]);
}

export const requestShakePermission = async (): Promise<boolean> => {
  // Request motion permission for iOS devices
  if (
    typeof (DeviceMotionEvent as any) !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    try {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Permission to device motion declined:', error);
      return false;
    }
  }
  // For non-iOS devices, permission is granted by default
  return true;
};
