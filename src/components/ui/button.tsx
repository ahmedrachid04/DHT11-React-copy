import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonProps, buttonVariants } from '@/lib/types/button-props'

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={props.disabled || props.loading}
      >
        {!(props.loading && size === 'icon') && props.children}
        {props.loading && <Loader2 className='animate-spin' />}
      </Comp>
    )
  }
)
Button.displayName = 'Button'
