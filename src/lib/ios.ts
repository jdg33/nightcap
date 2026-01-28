import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { App as CapApp } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';

export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';

export const haptics = {
  light: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  },

  medium: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  },

  heavy: async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  },

  success: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  },

  warning: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  },

  error: async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  },
};

export const statusBar = {
  setLight: async () => {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  setDark: async () => {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  hide: async () => {
    if (!isNative) return;
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  show: async () => {
    if (!isNative) return;
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },
};

export const keyboard = {
  hide: async () => {
    if (!isNative) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Keyboard error:', error);
    }
  },

  show: async () => {
    if (!isNative) return;
    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Keyboard error:', error);
    }
  },

  addListener: (callback: (info: { keyboardHeight: number }) => void) => {
    if (!isNative) return () => {};
    const listener = Keyboard.addListener('keyboardWillShow', callback);
    return () => listener.remove();
  },
};

export const splashScreen = {
  hide: async () => {
    if (!isNative) return;
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Splash screen error:', error);
    }
  },

  show: async () => {
    if (!isNative) return;
    try {
      await SplashScreen.show();
    } catch (error) {
      console.error('Splash screen error:', error);
    }
  },
};

export const share = {
  content: async (title: string, text: string, url?: string) => {
    if (!isNative) {
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return true;
        } catch (error) {
          console.error('Web share error:', error);
          return false;
        }
      }
      return false;
    }

    try {
      await Share.share({ title, text, url, dialogTitle: title });
      return true;
    } catch (error) {
      console.error('Native share error:', error);
      return false;
    }
  },
};

export const appState = {
  addListener: (callback: (state: { isActive: boolean }) => void) => {
    if (!isNative) return () => {};
    const listener = CapApp.addListener('appStateChange', callback);
    return () => listener.remove();
  },
};

export const storage = {
  set: async (key: string, value: string) => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  get: async (key: string): Promise<string | null> => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  remove: async (key: string) => {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: async () => {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};
