# DrawerPanel Component

A reusable, animated drawer panel component built with Framer Motion. Perfect for forms, multi-step workflows, and nested drawer experiences.

## Features

- ✨ **Smooth Animations**: Slides in from the right with spring physics
- 📐 **Fixed Width**: 700px wide with rounded corners and shadow
- 📱 **Three Sections**: Header, scrollable body, and sticky footer
- 🔢 **Multi-Step Support**: Built-in step indicators and navigation
- 🪆 **Nested Drawers**: Parent drawers slide left and blur when child opens
- 🎨 **Customizable**: Match your design system with className props
- ♿ **Accessible**: Keyboard navigation and backdrop click to close

## Installation

The component requires `framer-motion`:

```bash
npm install framer-motion
```

## Basic Usage

```tsx
import { useState } from "react";
import { DrawerPanel } from "@/components/ui/DrawerPanel";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      
      <DrawerPanel
        open={open}
        onClose={() => setOpen(false)}
        title="My Drawer"
        subtitle="Enter your information"
        showCancel
        showSave
        onSave={() => {
          // Handle save
          setOpen(false);
        }}
      >
        <div className="space-y-4">
          <Input placeholder="Name" />
          <Input placeholder="Email" />
        </div>
      </DrawerPanel>
    </>
  );
}
```

## Multi-Step Workflow

```tsx
const [step, setStep] = useState(1);

<DrawerPanel
  open={open}
  onClose={() => setOpen(false)}
  title={step === 1 ? "Step 1: Info" : "Step 2: Details"}
  currentStep={step}
  totalSteps={2}
  stepLabel={step === 1 ? "Basic information" : "Additional details"}
  showCancel
  showBack={step === 2}
  showNext={step === 1}
  showSave={step === 2}
  onBack={() => setStep(1)}
  onNext={() => setStep(2)}
  onSave={handleSave}
  nextDisabled={!isValid}
>
  {step === 1 ? <StepOneContent /> : <StepTwoContent />}
</DrawerPanel>
```

## Nested Drawers

```tsx
const [parentOpen, setParentOpen] = useState(false);
const [childOpen, setChildOpen] = useState(false);

// Parent Drawer
<DrawerPanel
  open={parentOpen}
  onClose={() => setParentOpen(false)}
  title="Parent Drawer"
  hasNestedDrawer={childOpen}  // Makes parent slide left when child opens
  zIndex={1200}
  {...props}
>
  <Button onClick={() => setChildOpen(true)}>
    Open Nested Drawer
  </Button>
</DrawerPanel>

// Child Drawer
<DrawerPanel
  open={childOpen}
  onClose={() => setChildOpen(false)}
  title="Child Drawer"
  zIndex={1500}  // Higher z-index than parent
  {...props}
>
  <p>Nested content</p>
</DrawerPanel>
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls drawer visibility |
| `onClose` | `() => void` | Called when drawer should close |
| `title` | `string` | Drawer title in header |
| `children` | `ReactNode` | Scrollable body content |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `subtitle` | `string` | - | Optional subtitle below title |
| `currentStep` | `number` | - | Current step number (for multi-step) |
| `totalSteps` | `number` | - | Total number of steps |
| `stepLabel` | `string` | - | Label for current step |
| `footer` | `ReactNode` | - | Custom footer content |
| `hasNestedDrawer` | `boolean` | `false` | Whether a nested drawer is open |
| `onBack` | `() => void` | - | Back button handler |
| `onNext` | `() => void` | - | Next button handler |
| `onSave` | `() => void` | - | Save button handler |
| `nextDisabled` | `boolean` | `false` | Disable next button |
| `nextLabel` | `string` | `"Next"` | Next button text |
| `saveLabel` | `string` | `"Save"` | Save button text |
| `showCancel` | `boolean` | `true` | Show cancel button |
| `showBack` | `boolean` | `false` | Show back button |
| `showNext` | `boolean` | `false` | Show next button |
| `showSave` | `boolean` | `false` | Show save button |
| `className` | `string` | - | Additional classes for drawer |
| `bodyClassName` | `string` | - | Additional classes for body |
| `zIndex` | `number` | `1200` | Z-index for drawer |

## Styling

The drawer matches the styling from the Campaigns Add Assets flow:

- **Width**: 700px fixed
- **Background**: `bg-background` from theme
- **Shadow**: `shadow-2xl` for depth
- **Border**: `border-b` on header, `border-t` on footer
- **Padding**: 6 spacing units (1.5rem) on header/footer
- **Body**: Scrollable with 6 unit padding and 5 unit vertical spacing

### Custom Styling

```tsx
<DrawerPanel
  className="border-l-4 border-primary"
  bodyClassName="bg-muted/10 space-y-8"
  {...props}
/>
```

## Animation Details

- **Enter**: Slides from right with spring physics (damping: 30, stiffness: 300)
- **Exit**: Slides back to right
- **Nested**: Slides left 700px and applies 2px blur + 0.9 opacity
- **Backdrop**: Fades in/out with 0.3s duration

## Z-Index Layering

Default z-index values for proper layering:

- **Parent Drawer**: 1200
- **Parent Backdrop**: 1100 (zIndex - 100)
- **Child Drawer**: 1500
- **Child Backdrop**: 1400

Adjust `zIndex` prop as needed for your specific use case.

## Best Practices

1. **Reset State on Close**: Clear form data and reset steps when drawer closes
2. **Validation**: Disable next/save buttons until form is valid
3. **Loading States**: Show loading indicators during async operations
4. **Error Handling**: Display error messages within the drawer body
5. **Nested Drawers**: Always use higher z-index for child drawers
6. **Backdrop Click**: Consider if clicking backdrop should close the drawer

## Examples

See `drawer-panel-example.tsx` for complete working examples:

- Simple single-step drawer
- Multi-step workflow
- Nested parent/child drawers
- Custom footer layouts

## Accessibility

- Backdrop can be clicked to close (calls `onClose`)
- Close button in header (X icon)
- Keyboard navigation supported via focus management
- Consider adding `aria-label` and `role` attributes for screen readers
