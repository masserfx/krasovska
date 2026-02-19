import { Check } from "lucide-react";

interface Props {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { label: "Košík", href: "/eshop/kosik" },
  { label: "Pokladna", href: "/eshop/pokladna" },
  { label: "Hotovo", href: "#" },
];

export default function CheckoutSteps({ currentStep }: Props) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <li key={step.label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-success text-white"
                      : isActive
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-muted"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-foreground"
                      : isCompleted
                        ? "text-success"
                        : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-12 sm:w-20 ${
                    isCompleted ? "bg-success" : "bg-gray-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
