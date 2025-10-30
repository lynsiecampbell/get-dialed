import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
  stepLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  hasNestedDrawer?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  saveLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  showSave?: boolean;
  className?: string;
  bodyClassName?: string;
  zIndex?: number;
}

export function DrawerPanel({
  open,
  onClose,
  title,
  subtitle,
  currentStep,
  totalSteps,
  stepLabel,
  children,
  footer,
  hasNestedDrawer = false,
  onBack,
  onNext,
  onSave,
  nextDisabled = false,
  nextLabel = "Next",
  saveLabel = "Save",
  showBack = false,
  showNext = false,
  showSave = false,
  className,
  bodyClassName,
  zIndex = 1200,
}: DrawerPanelProps) {
  
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: zIndex - 100 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ 
              x: hasNestedDrawer ? "-100px" : 0,
              opacity: hasNestedDrawer ? 0.95 : 1
            }}
            exit={{ x: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              opacity: { duration: 0.3 }
            }}
            className={cn(
              "fixed top-0 right-0 h-full w-[700px] bg-background",
              "shadow-2xl flex flex-col pointer-events-auto",
              className
            )}
            style={{ zIndex }}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Step Badge on same line */}
                  <div className="flex items-center gap-5">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    {currentStep && totalSteps && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        Step {currentStep} of {totalSteps}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  {currentStep && totalSteps && stepLabel && (
                    <span className="text-sm text-muted-foreground">{stepLabel}</span>
                  )}
                </div>
                
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className={cn(
              "flex-1 overflow-y-auto py-6 px-6 space-y-5",
              bodyClassName
            )}>
              {children}
            </div>

            {/* Footer */}
            {(footer || showBack || showNext || showSave) && (
              <div className="flex-shrink-0 border-t p-6">
                {footer || (
                  <div className="flex w-full gap-3 justify-between">
                    <div>
                      {showBack && onBack && (
                        <Button variant="outline" onClick={onBack}>
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {showNext && onNext && (
                        <Button
                          onClick={onNext}
                          disabled={nextDisabled}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {nextLabel}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      {showSave && onSave && (
                        <Button
                          onClick={onSave}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {saveLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
