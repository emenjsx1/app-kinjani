import { ReactNode } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[80px]",
                  isCurrent && "text-primary",
                  !isCurrent && "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CardSelectOption {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

interface CardSelectProps {
  options: CardSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export function CardSelect({ options, value, onChange, className }: CardSelectProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {options.map((option) => {
        const isSelected = value === option.id;

        return (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
              isSelected && "border-primary bg-primary/5 ring-2 ring-primary/20"
            )}
            onClick={() => onChange(option.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                {option.icon && (
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {option.icon}
                  </div>
                )}
                {isSelected && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <CardTitle className="text-base mt-2">{option.title}</CardTitle>
            </CardHeader>
            {option.description && (
              <CardContent>
                <CardDescription>{option.description}</CardDescription>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
