/**
 * DrawerPanel Component - Usage Examples
 * 
 * This file demonstrates how to use the DrawerPanel component for various scenarios.
 */

import { useState } from "react";
import { DrawerPanel } from "./DrawerPanel";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";

// Example 1: Simple Single-Step Drawer
export function SimpleDrawerExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Simple Drawer</Button>
      
      <DrawerPanel
        open={open}
        onClose={() => setOpen(false)}
        title="Simple Drawer"
        subtitle="This is a basic drawer example"
        showSave
        onSave={() => {
          console.log("Saving...");
          setOpen(false);
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Enter name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="Enter email" />
          </div>
        </div>
      </DrawerPanel>
    </>
  );
}

// Example 2: Multi-Step Drawer
export function MultiStepDrawerExample() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    console.log("Saving...");
    setOpen(false);
    setCurrentStep(1);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Multi-Step Drawer</Button>
      
      <DrawerPanel
        open={open}
        onClose={() => {
          setOpen(false);
          setCurrentStep(1);
        }}
        title={currentStep === 1 ? "Step 1: Basic Info" : "Step 2: Additional Details"}
        currentStep={currentStep}
        totalSteps={2}
        stepLabel={currentStep === 1 ? "Enter your information" : "Add more details"}
        showBack={currentStep === 2}
        showNext={currentStep === 1}
        showSave={currentStep === 2}
        onBack={handleBack}
        onNext={handleNext}
        onSave={handleSave}
        nextDisabled={false}
      >
        {currentStep === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input placeholder="Enter name" />
            </div>
            <div className="space-y-2">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="Enter email" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="Enter phone number" />
            </div>
          </div>
        )}
      </DrawerPanel>
    </>
  );
}

// Example 3: Nested Drawer (Parent with Child)
export function NestedDrawerExample() {
  const [parentOpen, setParentOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setParentOpen(true)}>Open Nested Drawer</Button>
      
      {/* Parent Drawer */}
      <DrawerPanel
        open={parentOpen}
        onClose={() => setParentOpen(false)}
        title="Parent Drawer"
        subtitle="This drawer can open a nested child drawer"
        hasNestedDrawer={childOpen}
        showSave
        onSave={() => {
          console.log("Saving parent...");
          setParentOpen(false);
        }}
        zIndex={1200}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to open a nested drawer
          </p>
          <Button onClick={() => setChildOpen(true)}>
            Open Child Drawer
          </Button>
        </div>
      </DrawerPanel>

      {/* Child Drawer */}
      <DrawerPanel
        open={childOpen}
        onClose={() => setChildOpen(false)}
        title="Child Drawer"
        subtitle="This is a nested drawer"
        showSave
        onSave={() => {
          console.log("Saving child...");
          setChildOpen(false);
        }}
        zIndex={1500}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This drawer appears on top of the parent drawer
          </p>
          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input placeholder="Enter item name" />
          </div>
        </div>
      </DrawerPanel>
    </>
  );
}

// Example 4: Custom Footer
export function CustomFooterDrawerExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Custom Footer Drawer</Button>
      
      <DrawerPanel
        open={open}
        onClose={() => setOpen(false)}
        title="Custom Footer"
        subtitle="This drawer has a custom footer layout"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Discard
            </Button>
            <Button variant="secondary" onClick={() => console.log("Draft saved")}>
              Save as Draft
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                console.log("Publishing...");
                setOpen(false);
              }}
            >
              Publish
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="Enter title" />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Input placeholder="Enter content" />
          </div>
        </div>
      </DrawerPanel>
    </>
  );
}
