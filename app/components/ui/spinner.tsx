import { cn } from "cn"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

type SpinnerProps = Omit<React.ComponentProps<"svg">, "size"> & {
  size?: number | string;
};

function Spinner({ className, size = 16, ...props }: SpinnerProps) {
  const numSize = typeof size === "number" ? size : parseInt(String(size), 10) || 16;
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      size={numSize}
      strokeWidth={2}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...(props as any)}
    />
  )
}

export { Spinner }
