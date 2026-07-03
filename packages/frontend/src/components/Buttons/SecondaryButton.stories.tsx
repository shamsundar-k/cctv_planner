import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut, Trash2, X } from "lucide-react";
import { expect, fn } from "storybook/test";
import { themeOptions } from "../../styles/theme";
import SecondaryButton from "./SecondaryButton";

const meta = {
  component: SecondaryButton,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="min-h-28 rounded-lg border border-panel-border bg-background p-6 text-text-primary">
        <Story />
      </div>
    ),
  ],
  args: {
    children: "Cancel",
    onClick: fn(),
  },
} satisfies Meta<typeof SecondaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeutralOutline: Story = {
  args: {
    variant: "outline",
    tone: "neutral",
    leadingIcon: <X size={16} aria-hidden="true" />,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Cancel" })).toBeEnabled();
  },
};

export const NeutralSoft: Story = {
  args: {
    variant: "soft",
    tone: "neutral",
    children: "Exit",
    leadingIcon: <LogOut size={16} aria-hidden="true" />,
  },
};

export const NeutralSolid: Story = {
  args: {
    variant: "solid",
    tone: "neutral",
    children: "Close",
  },
};

export const NeutralGhost: Story = {
  args: {
    variant: "ghost",
    tone: "neutral",
    children: "Dismiss",
  },
};

export const DangerSolid: Story = {
  args: {
    variant: "solid",
    tone: "danger",
    children: "Delete",
    leadingIcon: <Trash2 size={16} aria-hidden="true" />,
  },
};

export const DangerSoft: Story = {
  args: {
    variant: "soft",
    tone: "danger",
    children: "Remove",
  },
};

export const DangerOutline: Story = {
  args: {
    variant: "outline",
    tone: "danger",
    children: "Delete",
  },
};

export const DangerGhost: Story = {
  args: {
    variant: "ghost",
    tone: "danger",
    children: "Remove",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    children: "Cancel",
  },
};

export const Compact: Story = {
  args: {
    size: "compact",
    children: "Cancel",
  },
};

export const Medium: Story = {
  args: {
    size: "medium",
    children: "Exit",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    children: "Delete",
    tone: "danger",
  },
};

export const XLarge: Story = {
  args: {
    size: "xlarge",
    children: "Continue",
  },
};

export const Rounded: Story = {
  args: {
    shape: "rounded",
    children: "Cancel",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Closing",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Closing" })).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Cancel",
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
            <SecondaryButton variant="outline" tone="neutral" size="compact">
              Cancel
            </SecondaryButton>
            <SecondaryButton variant="outline" tone="neutral" size="small">
              Cancel
            </SecondaryButton>
            <SecondaryButton variant="soft" tone="neutral">
              Exit
            </SecondaryButton>
            <SecondaryButton variant="solid" tone="neutral">
              Close
            </SecondaryButton>
            <SecondaryButton variant="ghost" tone="neutral">
              Dismiss
            </SecondaryButton>
            <SecondaryButton variant="solid" tone="danger" leadingIcon={<Trash2 size={16} aria-hidden="true" />}>
              Delete
            </SecondaryButton>
            <SecondaryButton variant="outline" tone="neutral" size="xlarge">
              Continue
            </SecondaryButton>
            <SecondaryButton variant="outline" tone="neutral" shape="rounded">
              Cancel
            </SecondaryButton>
            <SecondaryButton variant="soft" tone="danger">
              Remove
            </SecondaryButton>
            <SecondaryButton disabled>Disabled</SecondaryButton>
          </div>
        </section>
      ))}
    </div>
  ),
};
