import type { Preview } from "@storybook/react-vite";
import { BrowserRouter } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import MockDate from "mockdate";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/index.css";
import "../src/api/interceptors";
import { ToastProvider } from "../src/components/ui/Toast";
import { queryClient } from "../src/queryClient";
import { ThemeProvider } from "../src/styles/ThemeProvider";
import { isTheme, themeOptions, type Theme } from "../src/styles/theme";
import { mswHandlers } from "./msw-handlers";

initialize({ onUnhandledRequest: "bypass" });

function getSelectedTheme(value: unknown): Theme {
  return typeof value === "string" && isTheme(value) ? value : "dark";
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "CCTV theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: themeOptions.map((theme) => ({
          value: theme.id,
          title: theme.label,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "dark",
  },
  decorators: [
    (Story, context) => {
      const theme = getSelectedTheme(context.globals.theme);
      localStorage.setItem("cctv-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);

      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <BrowserRouter>
                <Story />
              </BrowserRouter>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
  ],
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers: mswHandlers,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  async beforeEach() {
    MockDate.set("2024-04-01T12:00:00Z");
    queryClient.clear();
  },
};

export default preview;
