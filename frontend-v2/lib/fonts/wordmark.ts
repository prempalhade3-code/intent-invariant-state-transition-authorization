import localFont from "next/font/local";

/**
 * Mireye footer wordmark uses Stack Sans Notch (geometric sans, mono-linear strokes).
 * For exact Cy SemiLight: add NEXT_PUBLIC_ADOBE_FONTS_KIT with Cy in your Adobe web project,
 * or drop Cy-SemiLight.woff2 here and swap `src` below.
 */
export const wordmarkFont = localFont({
  src: "./StackSansNotch-Regular.woff2",
  weight: "400",
  display: "swap",
});
