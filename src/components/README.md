# Portfolio Components Documentation

This directory contains all the custom components for the modernized portfolio, organized by functionality and library.

## 📁 Directory Structure

```
components/
├── aceternity/          # Aceternity UI components
├── magicui/            # Magic UI components
├── 3d/                 # React Three Fiber 3D components
├── effects/            # Animation and effect components
├── hero/               # Hero section components
├── projects/           # Project showcase components
├── skills/             # Skills visualization components
├── terminal/           # Terminal interface components
├── timeline/           # Timeline components
├── ui/                 # Base UI components
└── README.md          # This file
```

---

## 🎨 Aceternity UI Components

Based on [Aceternity UI](https://ui.aceternity.com) - Beautiful animated components.

### BackgroundBeams

Animated light beams background effect.

```jsx
import { BackgroundBeams } from '@/components/aceternity/BackgroundBeams';

<div className="relative">
  <BackgroundBeams className="absolute inset-0" />
  <div className="relative z-10">Your content</div>
</div>
```

**Features:**

- 20 animated beams
- Gradient effects
- Green theme by default
- GPU accelerated

### TextGenerateEffect

Word-by-word text reveal animation.

```jsx
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect';

<TextGenerateEffect
  words="Your text here"
  className="text-lg"
  duration={0.5}
  filter={true}
/>
```

**Props:**

- `words` - Text to animate
- `className` - CSS classes
- `duration` - Animation duration per word
- `filter` - Enable blur filter (default: true)

### TypewriterEffect

Character-by-character typing animation.

```jsx
import { TypewriterEffect } from '@/components/aceternity/TypewriterEffect';

<TypewriterEffect
  words={[
    { text: "Hello", className: "text-green-500" },
    { text: "World", className: "text-blue-500" },
  ]}
  className="text-2xl"
  cursorClassName="bg-green-500"
/>
```

**Props:**

- `words` - Array of word objects with text and className
- `className` - Container CSS classes
- `cursorClassName` - Cursor style

### 3DCard (CardContainer, CardBody, CardItem)

Mouse-following 3D tilt effect for cards.

```jsx
import { CardContainer, CardBody, CardItem } from '@/components/aceternity/3DCard';

<CardContainer containerClassName="w-full">
  <CardBody className="relative group/card">
    <CardItem translateZ={20} className="text-xl">
      Title
    </CardItem>
    <CardItem translateZ={50} className="w-full">
      <img src="..." alt="..." />
    </CardItem>
    <CardItem translateZ={30}>
      Description
    </CardItem>
  </CardBody>
</CardContainer>
```

**Props:**

- `CardContainer`: `className`, `containerClassName`
- `CardItem`: `translateX`, `translateY`, `translateZ`, `rotateX`, `rotateY`, `rotateZ`

### AnimatedTooltip

Smooth animated tooltip on hover.

```jsx
import { AnimatedTooltip } from '@/components/aceternity/AnimatedTooltip';

<AnimatedTooltip
  items={[
    {
      id: 1,
      name: "John Doe",
      designation: "Developer",
      image: "/path/to/image.jpg"
    }
  ]}
/>
```

### FloatingDock

macOS-style dock navigation with magnifying effect.

```jsx
import { FloatingDock } from '@/components/aceternity/FloatingDock';
import { Home, User, Code } from 'lucide-react';

<FloatingDock
  items={[
    { title: "Home", icon: Home, href: "/" },
    { title: "About", icon: User, href: "/about" },
    { title: "Projects", icon: Code, href: "/projects" },
  ]}
  desktopClassName="fixed bottom-4"
  mobileClassName="fixed bottom-0"
/>
```

---

## ✨ Magic UI Components

Based on [Magic UI](https://magicui.design) - Advanced animated components.

### ShimmerButton

Button with shimmer hover effect.

```jsx
import { ShimmerButton } from '@/components/magicui/ShimmerButton';

<ShimmerButton
  shimmerColor="#ffffff"
  shimmerSize="0.05em"
  borderRadius="100px"
  shimmerDuration="3s"
  background="rgba(0, 0, 0, 1)"
  className="px-6 py-3"
>
  Click Me
</ShimmerButton>
```

### NumberTicker

Animated number counter that triggers on scroll.

```jsx
import { NumberTicker } from '@/components/magicui/NumberTicker';

<NumberTicker
  value={100}
  direction="up"
  delay={0}
  className="text-4xl"
  decimalPlaces={0}
/>
```

### AnimatedBeam

Connecting animated lines between elements.

```jsx
import { AnimatedBeam } from '@/components/magicui/AnimatedBeam';
import { useRef } from 'react';

const containerRef = useRef(null);
const fromRef = useRef(null);
const toRef = useRef(null);

<div ref={containerRef} className="relative">
  <div ref={fromRef}>Start</div>
  <div ref={toRef}>End</div>
  <AnimatedBeam
    containerRef={containerRef}
    fromRef={fromRef}
    toRef={toRef}
    curvature={0}
    gradientStartColor="#22c55e"
    gradientStopColor="#3b82f6"
  />
</div>
```

### GradientText

Animated gradient text effect.

```jsx
import { GradientText } from '@/components/magicui/GradientText';

<GradientText
  colors={["#22c55e", "#3b82f6", "#a855f7"]}
  animationSpeed={3}
  showBorder={false}
  className="text-4xl"
>
  Beautiful Text
</GradientText>
```

---

## 🎲 3D Components (React Three Fiber)

### FloatingShapes

Animated 3D geometric shapes background.

```jsx
import FloatingShapes from '@/components/3d/FloatingShapesWrapper';

<div className="relative">
  <FloatingShapes className="absolute inset-0 opacity-60" />
  <div className="relative z-10">Your content</div>
</div>
```

**Features:**

- Multiple geometric primitives (spheres, toruses, cubes)
- Floating animation
- Wireframe and transparent materials
- Multiple colors
- Non-distracting opacity

**Note:** Always use the wrapper component for proper SSR handling.

---

## 🎯 Project Components

### ProjectCard3D

3D tilting project card with holographic effects.

```jsx
import ProjectCard3D from '@/components/projects/ProjectCard3D';

<ProjectCard3D
  project={{
    name: "Project Name",
    description: "Description",
    techStack: ["React", "Next.js"],
    github: "https://github.com/...",
    live: "https://...",
    image: "/path/to/image.jpg",
    stats: { stars: 10, forks: 5 },
    featured: true,
    year: "2025"
  }}
  onCardClick={(project) => console.log(project)}
/>
```

**Features:**

- Full 3D tilt effect
- Holographic border animation
- Gradient backgrounds
- Layered content with Z-depth
- Quick action buttons
- Featured badge
- Stats display

---

## 🌊 Effects Components

### SmoothScroll

Lenis smooth scrolling wrapper.

```jsx
import { SmoothScroll } from '@/components/effects/SmoothScroll';

<SmoothScroll>
  <YourApp />
</SmoothScroll>
```

**Configuration:**

- Duration: 1.2s
- Custom easing function
- Vertical direction
- Touch support

---

## 🎬 Animation Utilities

### Framer Motion Variants

```jsx
import { fadeIn, fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { motion } from 'framer-motion';

<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeInUp}
>
  Content
</motion.div>

<motion.div variants={staggerContainer}>
  {items.map((item, i) => (
    <motion.div key={i} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

**Available Variants:**

- `fadeIn` - Simple fade in
- `fadeInUp` - Fade in with upward movement
- `fadeInDown` - Fade in with downward movement
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right
- `scaleIn` - Scale and fade in
- `staggerContainer` - Container for staggered children
- `staggerItem` - Individual staggered item
- `slideIn(direction, delay)` - Directional slide
- `spring` - Fast spring physics
- `smoothSpring` - Gentle spring physics

### GSAP ScrollTrigger

```jsx
import { fadeInOnScroll, parallax } from '@/lib/animations/scroll-animations';
import { useEffect, useRef } from 'react';

const MyComponent = () => {
  const elementRef = useRef(null);

  useEffect(() => {
    fadeInOnScroll(elementRef.current);

    return () => {
      // Cleanup handled automatically
    };
  }, []);

  return <div ref={elementRef}>Content</div>;
};
```

**Available Functions:**

- `fadeInOnScroll` - Fade in when scrolling into view
- `staggerFadeIn` - Stagger multiple elements
- `parallax` - Parallax scroll effect
- `horizontalScroll` - Horizontal scrolling section
- `pinSection` - Pin section while animating
- `animateNumber` - Number counter animation
- `scaleIn` - Scale in on scroll
- `revealAnimation` - Clip path reveal
- `rotateIn` - Rotate and fade in
- `slideInLeft` - Slide from left
- `slideInRight` - Slide from right
- `cleanupScrollTriggers` - Cleanup utility

---

## 🪝 Custom Hooks

### useMousePosition

```jsx
import { useMousePosition } from '@/hooks/useMousePosition';

const MyComponent = () => {
  const { x, y } = useMousePosition();

  return <div>Mouse: {x}, {y}</div>;
};
```

---

## 🎨 Styling Guidelines

### Color Palette

- Primary: Green (#22c55e)
- Secondary: Blue (#3b82f6)
- Accent: Purple (#a855f7)
- Background: Dark grays
- Text: Light grays / white

### Animation Timing

- Fast: 200-300ms
- Standard: 400-600ms
- Slow: 800-1200ms
- Spring stiffness: 400
- Spring damping: 30

### Z-Index Layers

- Background: -10 to 0
- Content: 1 to 10
- Overlays: 20 to 30
- Tooltips: 40 to 50
- Modals: 100+

---

## 🚀 Performance Tips

1. **Dynamic Imports**

   ```jsx
   const Heavy = dynamic(() => import('./Heavy'), {
     ssr: false,
     loading: () => <Skeleton />
   });
   ```

2. **Lazy Loading**

   ```jsx
   import { useInView } from 'react-intersection-observer';

   const { ref, inView } = useInView({ triggerOnce: true });

   <div ref={ref}>
     {inView && <HeavyComponent />}
   </div>
   ```

3. **GPU Acceleration**
   - Use `transform` and `opacity` for animations
   - Avoid animating `width`, `height`, `top`, `left`
   - Use `will-change` sparingly

4. **3D Optimization**
   - Limit particle counts
   - Use simple geometries
   - Dispose resources in cleanup
   - Use low opacity materials

---

## ♿ Accessibility

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators visible
- Logical tab order

### Screen Readers

- Semantic HTML
- ARIA labels where needed
- Alt text on images

### Reduced Motion

```jsx
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<motion.div
  animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
>
  Content
</motion.div>
```

---

## 📝 Best Practices

1. **Component Structure**
   - Keep components focused and single-purpose
   - Extract reusable logic to hooks
   - Use composition over inheritance

2. **Naming Conventions**
   - Components: PascalCase
   - Files: PascalCase for components
   - Hooks: camelCase with 'use' prefix
   - Utils: camelCase

3. **Props**
   - Provide sensible defaults
   - Document expected prop types
   - Use destructuring with defaults

4. **Effects**
   - Always cleanup in useEffect
   - Minimize dependencies
   - Use custom hooks for complex logic

---

## 🔍 Troubleshooting

### 3D Components Not Rendering

- Check that wrapper is being used (SSR disabled)
- Verify WebGL support in browser
- Check console for Three.js errors

### Animations Not Working

- Verify Framer Motion is installed
- Check that motion components are used
- Ensure variants are properly defined

### ScrollTrigger Issues

- Make sure GSAP is registered
- Check trigger element exists
- Verify scroll container is correct

---

## 📚 Additional Resources

- [Aceternity UI Docs](https://ui.aceternity.com)
- [Magic UI Docs](https://magicui.design)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Framer Motion](https://www.framer.com/motion)
- [GSAP](https://gsap.com/docs/v3)

---

*Last Updated: 2025-10-02*
*Version: 1.0*
