// Stub for next-themes - not used in this project
import React from "react";
export const useTheme = () => ({ theme: 'dark', setTheme: (_: string) => {}, resolvedTheme: 'dark' });
export const ThemeProvider = ({ children }: { children: React.ReactNode; attribute?: string; defaultTheme?: string; enableSystem?: boolean; }) => React.createElement(React.Fragment, null, children);
