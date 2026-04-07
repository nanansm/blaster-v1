# 🎨 CSS QUICK REFERENCE GUIDE

## Mote Blaster Custom CSS System

---

## 📐 LAYOUT CLASSES

### Container
```css
.container          /* Max-width 1280px, centered */
```

### Flexbox
```css
.flex               /* display: flex */
.inline-flex        /* display: inline-flex */
.flex-col           /* flex-direction: column */
.flex-row           /* flex-direction: row */
.items-center       /* align-items: center */
.items-start        /* align-items: flex-start */
.items-end          /* align-items: flex-end */
.justify-center     /* justify-content: center */
.justify-between    /* justify-content: space-between */
.justify-end        /* justify-content: flex-end */
.flex-1             /* flex: 1 */
```

### Grid
```css
.grid               /* display: grid */
.grid-cols-1        /* 1 column */
.grid-cols-2        /* 2 columns */
.grid-cols-3        /* 3 columns */
.grid-cols-4        /* 4 columns */

/* Responsive */
.md:grid-cols-2     /* 2 cols on tablet+ */
.lg:grid-cols-4     /* 4 cols on desktop+ */
```

### Gap
```css
.gap-1              /* 0.25rem gap */
.gap-2              /* 0.5rem gap */
.gap-3              /* 0.75rem gap */
.gap-4              /* 1rem gap */
.gap-6              /* 1.5rem gap */
```

---

## 📏 SPACING CLASSES

### Padding
```css
.p-0                /* 0 */
.p-2                /* 0.5rem */
.p-4                /* 1rem */
.p-6                /* 1.5rem */
.p-8                /* 2rem */

.px-4               /* padding-left/right: 1rem */
.py-4               /* padding-top/bottom: 1rem */
```

### Margin
```css
.m-0                /* 0 */
.m-4                /* 1rem */
.mx-auto            /* margin-left/right: auto (center) */

.mb-2               /* margin-bottom: 0.5rem */
.mb-4               /* margin-bottom: 1rem */
.mb-8               /* margin-bottom: 2rem */

.mt-4               /* margin-top: 1rem */
```

### Space Between Children
```css
.space-y-4          /* 1rem vertical spacing between children */
.space-x-4          /* 1rem horizontal spacing between children */
```

---

## 📝 TYPOGRAPHY CLASSES

### Font Size
```css
.text-xs            /* 0.75rem */
.text-sm            /* 0.875rem */
.text-base          /* 1rem */
.text-lg            /* 1.125rem */
.text-xl            /* 1.25rem */
.text-2xl           /* 1.5rem */
.text-3xl           /* 1.875rem */
.text-4xl           /* 2.25rem */
```

### Font Weight
```css
.font-normal        /* 400 */
.font-medium        /* 500 */
.font-semibold      /* 600 */
.font-bold          /* 700 */
.font-mono          /* Monospace font */
```

### Text Alignment
```css
.text-center        /* text-align: center */
.text-left          /* text-align: left */
.text-right         /* text-align: right */
```

### Text Color
```css
.text-foreground         /* Main text color */
.text-muted-foreground   /* Muted/subtle text */
.text-primary            /* Primary color text */
.text-success            /* Green text */
.text-warning            /* Yellow/orange text */
.text-destructive        /* Red text */
```

---

## 🎨 COLOR CLASSES

### Background
```css
.bg-background      /* Page background */
.bg-card            /* Card background */
.bg-primary         /* Primary color background */
.bg-secondary       /* Secondary color background */
.bg-muted           /* Muted background */
.bg-destructive     /* Destructive/red background */
```

---

## 🔘 BUTTON CLASSES

### Base Button
```css
.btn                /* Base button styles */
.btn-sm             /* Small button */
.btn-lg             /* Large button */
```

### Button Variants
```css
.btn-primary        /* Primary action button */
.btn-secondary      /* Secondary action */
.btn-destructive    /* Danger/delete action */
.btn-outline        /* Outlined button */
.btn-ghost          /* Ghost/text button */
.btn-link           /* Link-styled button */
```

### Usage Example
```tsx
<button className="btn btn-primary btn-lg">
  Click Me
</button>
```

---

## 📦 CARD CLASSES

### Card Components
```css
.card               /* Card container */
.card-header        /* Card header section */
.card-title         /* Card heading */
.card-description   /* Card subtitle */
.card-content       /* Card body */
.card-footer        /* Card footer */
```

### Usage Example
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

## 🏷️ BADGE CLASSES

```css
.badge              /* Base badge */
.badge-default      /* Primary colored badge */
.badge-secondary    /* Secondary colored badge */
.badge-destructive  /* Red/danger badge */
.badge-outline      /* Outlined badge */
```

### Usage Example
```tsx
<Badge variant="default">Active</Badge>
```

---

## 📊 DASHBOARD COMPONENT CLASSES

### Stat Cards
```css
.stat-card-header   /* Stat card header with icon */
.stat-value         /* Large metric number */
.stat-description   /* Metric helper text */
```

### Activity Items
```css
.activity-item      /* Activity/recent item card */
.activity-info      /* Activity text container */
```

### System Status
```css
.queue-status       /* Queue status row */
.wppconnect-status  /* WPPConnect connection indicator */
```

---

## 🧭 NAVIGATION CLASSES

### Sidebar
```css
.sidebar            /* Sidebar container (responsive) */
.sidebar-header     /* Sidebar header */
.sidebar-logo       /* Logo container */
.sidebar-logo-text  /* Logo text */
.sidebar-nav        /* Navigation container */
.sidebar-link       /* Navigation link */
.sidebar-link-active    /* Active link styling */
.sidebar-link-inactive  /* Inactive link styling */
```

### Header
```css
.header             /* Top header bar */
.header-content     /* Header content container */
.header-title       /* Header title text */
```

---

## 📄 PAGE LAYOUT CLASSES

### Page Containers
```css
.homepage-container   /* Landing page layout */
.signin-container     /* Auth page centered layout */
.dashboard-layout     /* Main app layout */
.dashboard-main       /* Main content area */
.dashboard-content    /* Dashboard content container */
```

---

## 🔧 ICON SIZE CLASSES

```css
.icon-xs            /* 0.75rem */
.icon-sm            /* 1rem */
.icon-md            /* 1.25rem */
.icon-lg            /* 1.5rem */
.icon-xl            /* 2rem */
```

### Usage Example
```tsx
<Megaphone className="icon-sm text-muted-foreground" />
```

---

## 📱 RESPONSIVE CLASSES

### Breakpoints
- **Mobile**: < 768px (default)
- **Tablet**: ≥ 768px (`md:` prefix)
- **Desktop**: ≥ 1024px (`lg:` prefix)

### Responsive Visibility
```css
.md:flex            /* Show on tablet+ */
.md:hidden          /* Hide on tablet+ */
```

### Responsive Grid
```css
.grid-cols-1 md:grid-cols-2 lg:grid-cols-4
/* 1 col on mobile, 2 on tablet, 4 on desktop */
```

---

## ✨ UTILITY CLASSES

### Borders
```css
.border             /* 1px border */
.border-0           /* No border */
.rounded-md         /* Medium border radius */
.rounded-lg         /* Large border radius */
.rounded-full       /* Pill shape */
```

### Shadows
```css
.shadow-sm          /* Small shadow */
.shadow-md          /* Medium shadow */
.shadow-lg          /* Large shadow */
```

### Width/Height
```css
.w-full             /* width: 100% */
.w-64               /* width: 16rem */
.max-w-md           /* max-width: 28rem */
.max-w-5xl          /* max-width: 64rem */
.h-screen           /* height: 100vh */
.min-h-screen       /* min-height: 100vh */
```

### Position
```css
.relative           /* position: relative */
.absolute           /* position: absolute */
.sticky             /* position: sticky */
.top-0              /* top: 0 */
```

### Display
```css
.hidden             /* display: none */
.block              /* display: block */
```

### Overflow
```css
.overflow-hidden    /* overflow: hidden */
.overflow-y-auto    /* vertical scroll */
```

---

## 🎭 ANIMATION CLASSES

```css
.animate-pulse      /* Pulsing animation */
.animate-spin       /* Spinning animation */
.transition-colors  /* Color transition */
```

---

## ♿ ACCESSIBILITY CLASSES

```css
.sr-only            /* Screen reader only (visually hidden) */
```

---

## 🎯 CSS VARIABLES (THEME)

### Using CSS Variables
```css
/* In your CSS */
background-color: hsl(var(--background));
color: hsl(var(--foreground));
border-color: hsl(var(--border));
```

### Available Variables
```css
--background        /* Page background */
--foreground        /* Main text color */
--card              /* Card background */
--primary           /* Primary action color */
--secondary         /* Secondary action color */
--destructive       /* Danger/delete color */
--success           /* Success color */
--warning           /* Warning color */
--border            /* Border color */
--input             /* Input border color */
--ring              /* Focus ring color */
--muted             /* Muted background */
--muted-foreground  /* Muted text color */
--accent            /* Accent background */
--accent-foreground /* Accent text color */
```

### Spacing Variables
```css
--spacing-xs        /* 0.25rem */
--spacing-sm        /* 0.5rem */
--spacing-md        /* 1rem */
--spacing-lg        /* 1.5rem */
--spacing-xl        /* 2rem */
--spacing-2xl       /* 3rem */
```

---

## 📝 EXAMPLES

### Complete Card Example
```tsx
<Card>
  <CardHeader className="stat-card-header">
    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
    <Users className="icon-sm text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="stat-value">1,234</div>
    <p className="stat-description">Active users</p>
  </CardContent>
</Card>
```

### Responsive Grid Example
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

### Button Group Example
```tsx
<div className="flex gap-4">
  <Button className="btn btn-primary btn-lg">Primary</Button>
  <Button className="btn btn-outline btn-lg">Secondary</Button>
  <Button className="btn btn-destructive btn-sm">Delete</Button>
</div>
```

---

**Last Updated**: April 7, 2026  
**CSS File**: `src/app/globals.css` (28KB)  
**Total Classes**: 200+

