import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    // Map variant to CSS classes
    const variantClass = variant === 'default' ? 'btn-primary' :
                        variant === 'destructive' ? 'btn-destructive' :
                        variant === 'outline' ? 'btn-outline' :
                        variant === 'secondary' ? 'btn-secondary' :
                        variant === 'ghost' ? 'btn-ghost' :
                        variant === 'link' ? 'btn-link' : 'btn-primary'
    
    // Map size to CSS classes
    const sizeClass = size === 'default' ? 'btn' :
                     size === 'sm' ? 'btn btn-sm' :
                     size === 'lg' ? 'btn btn-lg' :
                     size === 'icon' ? 'btn' : 'btn'
    
    const buttonClass = `${sizeClass} ${variantClass} ${className || ''}`

    return (
      <button
        className={buttonClass}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
