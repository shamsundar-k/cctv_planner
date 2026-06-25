import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "blue";

export default function UITest() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="m-6 rounded-xl border border-primary bg-background p-6 
    text-foreground shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-primary">
        Theme Test
      </h2>

      <p className="mb-6">
        Current Theme: <span className="font-semibold">{theme}</span>
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setTheme("light")}
          className="rounded bg-primary px-4 py-2 text-white transition-opacity hover:opacity-80"
        >
          Light
        </button>

        <button
          onClick={() => setTheme("dark")}
          className="rounded bg-primary px-4 py-2 text-white transition-opacity hover:opacity-80"
        >
          Dark
        </button>

        <button
          onClick={() => setTheme("blue")}
          className="rounded bg-primary px-4 py-2 text-white transition-opacity hover:opacity-80"
        >
          Blue
        </button>
      </div>

      <div className="space-y-4 rounded-lg border border-primary p-4">
        <h3 className="text-xl font-semibold text-primary">
          Sample Components
        </h3>

        <input
          type="text"
          placeholder="Input field"
          className="w-full rounded border border-primary bg-background p-2"
        />

        <button className="rounded bg-primary px-4 py-2 text-white transition-opacity hover:opacity-80">
          Primary Button
        </button>

        <div className="rounded border border-primary p-4">
          This card should change with the theme.
        </div>
      </div>
    </div>
  );
}