import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Save } from "lucide-react";
import { expect, fn } from "storybook/test";
import { themeOptions } from "../../styles/theme";
import PrimaryButton from "./PrimaryButton";

const meta = {
  component: PrimaryButton,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="min-h-28 rounded-lg border border-panel-border bg-background p-6 text-text-primary">
        <Story />
      </div>
    ),
  ],
  args: {
    children: "Save",
    onClick: fn(),
  },
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  args: {
    variant: "solid",
    leadingIcon: <Save size={16} aria-hidden="true" />,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Save" })).toBeEnabled();
  },
};

export const Soft: Story = {
  args: {
    variant: "soft",
    children: "Accept",
    leadingIcon: <Check size={16} aria-hidden="true" />,
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "OK",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Done",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    children: "Save",
  },
};

export const Compact: Story = {
  args: {
    size: "compact",
    children: "Create",
  },
};

export const Medium: Story = {
  args: {
    size: "medium",
    children: "Accept",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    children: "Done",
  },
};

export const XLarge: Story = {
  args: {
    size: "xlarge",
    fullWidth: true,
    children: "Sign in",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Saving",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Saving" })).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Save",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: "Accept Invitation",
  },
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="grid gap-4">
      {themeOptions.map((theme) => (
        <section
          key={theme.id}
          data-theme={theme.id}
          className="rounded-lg border border-panel-border bg-background p-4 text-text-primary shadow-sm"
        >
          <h3 className="mb-3 text-sm font-semibold">{theme.label}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryButton variant="solid" size="compact">
              Create
            </PrimaryButton>
            <PrimaryButton variant="solid" size="small">
              Save
            </PrimaryButton>
            <PrimaryButton variant="soft" size="medium">
              Accept
            </PrimaryButton>
            <PrimaryButton variant="outline" size="medium">
              OK
            </PrimaryButton>
            <PrimaryButton variant="ghost" size="large">
              Done
            </PrimaryButton>
            <PrimaryButton variant="solid" size="xlarge">
              Sign in
            </PrimaryButton>
            <PrimaryButton loading>Saving</PrimaryButton>
            <PrimaryButton disabled>Disabled</PrimaryButton>
          </div>
        </section>
      ))}
    </div>
  ),
};
