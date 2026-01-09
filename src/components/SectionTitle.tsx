import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center" | "right";
}

export const SectionTitle = ({
  title,
  subtitle,
  className,
  align = "center",
}: SectionTitleProps) => {
  return (
    <div
      className={cn(
        "mb-8 md:mb-12",
        align === "center" && "text-center",
        align === "left" && "text-left",
        align === "right" && "text-right",
        className
      )}
    >
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-4 h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full",
          align === "center" && "mx-auto",
          align === "right" && "ml-auto"
        )}
      />
    </div>
  );
};
