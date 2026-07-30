/** Mirrors svar_ai/lib/core/constants/support_config.dart. */

export const SUPPORT_EMAIL = "tech@svar.ai";
export const ANDROID_PACKAGE_ID = "com.svar.ai";

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;

/** Set once the App Store listing exists. */
export const IOS_APP_STORE_ID = "";

export const APP_STORE_URL = IOS_APP_STORE_ID
  ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
  : null;
