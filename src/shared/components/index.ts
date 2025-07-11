// UI component exports
export * from "./ui";

// Layout component exports
export { default as Navbar } from "./layout/navigation/Navbar";
export { default as Footer } from "./layout/navigation/Footer";

// Analytics component exports
export { default as GoogleAnalytics } from "./analytics/GoogleAnalytics";
export { default as PageViewTracker } from "./analytics/PageViewTracker";
export { default as SegmentProvider } from "./analytics/SegmentProvider";
export { default as MetaPixel } from "./analytics/MetaPixel";
export { default as MetaPixelPageTracker } from "./analytics/MetaPixelPageTracker";

// Theme component exports
export { ThemeProvider } from "./theme/theme-provider";
export { default as ThemeToggle } from "./theme/theme-toggle";

// Section component exports
export { default as AboutSection } from "./sections/AboutSection";
export { default as AnnouncementBanner } from "./sections/AnnouncementBanner";
export { CompetitionList } from "./sections/CompetitionList";
export { default as FaqSection } from "./sections/FaqSection";
export { default as Hero } from "./sections/Hero";
export { default as HeroCarousel } from "./sections/HeroCarousel";
export { default as HowItWorks } from "./sections/HowItWorks";
