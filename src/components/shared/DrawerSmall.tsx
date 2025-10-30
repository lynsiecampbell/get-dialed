import React, { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerSmallProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  
  // Footer props
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  footerLeftContent?: ReactNode;
  hideFooter?: boolean;
  
  // Header props
  headerActions?: ReactNode;
  
  // Loading state
  isLoading?: boolean;
  
  // Nested drawer support
  hasNestedDrawer?: boolean;
  zIndex?: number;
}

export function DrawerSmall({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel',
  footerLeftContent,
  hideFooter = false,
  headerActions,
  isLoading = false,
  hasNestedDrawer = false,
  zIndex = 50,
}: DrawerSmallProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className={cn(
          "w-[500px] sm:max-w-[500px] p-0 flex flex-col transition-all duration-300",
          hasNestedDrawer && "translate-x-[-100px] opacity-95"
        )}
        style={{ zIndex }}
        onEscapeKeyDown={onClose}
      >
        {/* Header */}
        <SheetHeader className="px-8 py-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl font-semibold text-gray-900">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="text-sm text-gray-500 mt-1">
                  {description}
                </SheetDescription>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {headerActions}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-sm hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {footerLeftContent}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="h-10 px-4 text-sm font-medium border-teal-500 text-teal-600 hover:bg-teal-50 rounded-sm"
                >
                  {cancelText}
                </Button>
                {onSave && (
                  <Button
                    onClick={onSave}
                    disabled={isLoading}
                    className="h-10 px-4 text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white rounded-sm"
                  >
                    {isLoading ? 'Saving...' : saveText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
