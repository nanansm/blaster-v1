import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantClass = variant === 'default' ? 'badge badge-default' :
                      variant === 'secondary' ? 'badge badge-secondary' :
                      variant === 'destructive' ? 'badge badge-destructive' :
                      variant === 'outline' ? 'badge badge-outline' :
                      'badge badge-default'
  
  return (
    <div className={`${variantClass} ${className || ''}`} {...props} />
  )
}

export { Badge }
