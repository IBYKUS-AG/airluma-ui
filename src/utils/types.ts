export type SupportTextState = 'default' | 'alert' | 'warning' | 'success';
export type SelectOption = { value: string; label: string };

export type AccordionIconPosition = 'leading' | 'trailing';
export type AccordionItem = {
  title: string;
  /**
   * Rendered as raw HTML via `unsafeHTML` (same trust model as `ibk-table`'s
   * cell/header content) — never pass content derived from unsanitized user
   * input. Sanitize before assigning, e.g. with DOMPurify, if the source is
   * not fully controlled by the consuming application.
   */
  content: string;
  active?: boolean;
  disabled?: boolean;
};

export type ButtonVariant = 'regular' | 'decent';
export type ButtonType = 'primary' | 'secondary' | 'success' | 'destructive';
export type ButtonHtmlType = 'button' | 'submit' | 'reset';
export type IconPosition = 'leading' | 'trailing' | 'text' | 'solo';

export type DropdownPlacement = 'bottom-start' | 'bottom-end';
export type DropdownItem = {
  /** Row text. A separator carries none. */
  label?: string;
  /** IBYKUS-Iconset ligature rendered before the label; no `icon`, no icon slot. */
  icon?: string;
  /**
   * Keyboard hint on the trailing edge, e.g. `Strg + V`. An item that opens a
   * submenu shows the submenu chevron there instead, so the two never collide.
   */
  shortcut?: string;
  /** Handed to `dropdown-select` in place of the label when the row is chosen. */
  value?: string;
  disabled?: boolean;
  /** Nested rows. Their presence is what turns this row into a submenu parent. */
  items?: DropdownItem[];
  /** Renders a horizontal rule instead of a row; every other field is ignored. */
  separator?: boolean;
};

export type SegmentedControlDominance = 'regular' | 'prominent';
export type SegmentedControlItem = {
  label: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
};

export type StepButtonDominance = 'prominent' | 'regular' | 'decent';
export type StepButtonSize = '40' | '20';
export type StepButtonShape = 'round' | 'quad' | 'rect';
export type NavigationMenuItemVariant = 'regular' | 'prominent';

export type RadioGroupState = 'alert' | 'success' | 'default';
export type RadioLabelPosition = 'leading' | 'trailing';
export type CheckboxLabelPosition = 'leading' | 'trailing';
export type CheckboxState = 'default' | 'alert' | 'success';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BadgeVariant = 'decent' | 'regular';

export type CardVariant = 'filled' | 'bordered' | 'elevated';
export type CardDelta = '0' | '2' | '6' | '10';

export type ChipStatus = 'passive' | 'active';
export type ChipVariant = 'regular' | 'decent';
export type ChipType = 'default' | 'info' | 'success' | 'warning' | 'alert';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
export type InputState = 'default' | 'alert' | 'warning' | 'success';

export type SwitchLabelPosition = 'leading' | 'trailing';
export type SwitchState = 'default' | 'alert' | 'success';

export type TextareaState = 'default' | 'alert' | 'success' | 'warning';

export type LinkVariant = 'regular' | 'decent';

export type MeterVariant = 'regular' | 'decent';
export type MeterLevel = 'max' | 'highPos' | 'highNeg' | 'optimal' | 'low' | 'min';

export type ProgressVariant = 'regular' | 'decent';
export type ProgressType = 'linear' | 'circular' | 'spinner';

export type RangeSliderDominance = 'regular' | 'decent';
export type RangeSliderState = 'default' | 'warning';

export type RatingVariant = 'red' | 'gold';

export type TooltipType = 'tooltip' | 'toggletip';

export type IbkTableHeader = {
  label: string;
  align?: 'left' | 'right' | 'center';
  icon?: string;
  class?: string;
};

export type BottomNavigationVariant = 'regular' | 'decent';
export type BottomNavigationDominance = 'regular' | 'prominent';
export type BottomNavigationItem = {
  label?: string;
  icon?: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
};

export type TopNavigationItem = {
  label: string;
  href?: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
};
