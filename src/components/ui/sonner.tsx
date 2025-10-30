import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-[#E6F8ED] group-[.toaster]:text-gray-700 group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#22C55E]",
          error: "group-[.toaster]:bg-[#FEECEC] group-[.toaster]:text-gray-700 group-[.toaster]:border-l-4 group-[.toaster]:border-l-[#EF4444]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
