import { Capacitor } from '@capacitor/core';
import type { Platform } from './types';
import { webPlatform } from './web';
import { nativePlatform } from './native';

export type { Platform };

export const platform: Platform = Capacitor.isNativePlatform() ? nativePlatform() : webPlatform();
