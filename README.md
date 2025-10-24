# 🚀 Modern Portfolio Website

A cutting-edge portfolio website built with Next.js 15, featuring stunning 3D animations, smooth scroll effects, and modern UI components. Showcasing full-stack development and AI engineering projects with an emphasis on visual excellence and user experience.

![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

### 🎨 Modern UI/UX

- **3D Interactive Elements** - Mouse-following tilt effects using React Three Fiber
- **Smooth Scrolling** - Buttery-smooth scroll experience with Lenis
- **Advanced Animations** - GSAP ScrollTrigger and Framer Motion animations
- **Responsive Design** - Fully responsive across all devices
- **Dark Mode** - System-aware theme switching with next-themes

### 🎭 Visual Effects

- **Background Beams** - Animated light beam effects
- **Floating 3D Shapes** - WebGL-powered geometric shapes
- **Holographic Cards** - 3D project cards with gradient borders
- **Text Animations** - Typewriter, text generation, and gradient effects
- **Shimmer Effects** - Interactive button animations
- **Particle Systems** - Dynamic particle backgrounds

### 🛠️ Technical Features

- **Server-Side Rendering** - Optimized Next.js App Router
- **GitHub Integration** - Automatic project syncing from GitHub
- **Image Optimization** - Automated WebP/AVIF conversion with Sharp
- **Contact Form** - EmailJS integration for contact functionality
- **Analytics** - Vercel Analytics and Speed Insights
- **SEO Optimized** - Dynamic metadata and sitemap generation
- **Docker Support** - Production-ready containerization

### 📱 Sections

- **Hero** - Eye-catching landing with 3D effects and animations
- **About** - Professional introduction with skills showcase
- **Projects** - Interactive 3D project cards with filtering
- **Skills** - Technology stack visualization
- **Blog** - External blog integration with previews
- **Contact** - Functional contact form with validation

## 🏗️ Tech Stack

### Core Framework

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript/JavaScript](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn UI](https://ui.shadcn.com/)** - Re-usable component library
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animation library
- **[GSAP](https://greensock.com/gsap/)** - Professional-grade animations

### 3D & Graphics

- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** - Three.js React renderer
- **[Drei](https://github.com/pmndrs/drei)** - Three.js helpers and abstractions
- **[tsParticles](https://particles.js.org/)** - Particle effects library

### Forms & Validation

- **[React Hook Form](https://react-hook-form.com/)** - Performant form management
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[EmailJS](https://www.emailjs.com/)** - Email service integration

### Utilities

- **[Lenis](https://github.com/studio-freight/lenis)** - Smooth scroll library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - Code syntax highlighting

### DevOps & Deployment

- **[Docker](https://www.docker.com/)** - Containerization
- **[Vercel](https://vercel.com/)** - Deployment platform
- **[Cloudflare](https://www.cloudflare.com/)** - CDN and edge computing
- **[Sharp](https://sharp.pixelplumbing.com/)** - Image optimization

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.x or higher
- **pnpm** (recommended) or npm/yarn
- **Git** for version control
- **Docker** (optional, for containerized deployment)

## 🚀 How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/Msparihar/portfolio.git
cd portfolio
```

### 2. Install Dependencies

Using pnpm (recommended):

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory (optional for development):

```env
# GitHub API (optional - for contribution graph)
GITHUB_TOKEN=your_github_personal_access_token

# EmailJS Configuration (for contact form)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### 4. Run Development Server

```bash
pnpm dev
```

Or:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
pnpm build
pnpm start
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and run
docker-compose up -d

# Stop
docker-compose down
```

The application will be available at [http://localhost:4000](http://localhost:4000)

### Manual Docker Build

```bash
# Build image
docker build -t portfolio .

# Run container
docker run -p 4000:3000 portfolio
```

## 🧪 How to Test

### Run ESLint

```bash
pnpm lint
```

### Check Build

```bash
pnpm build
```

This will verify:

- No TypeScript/JavaScript errors
- All dependencies resolve correctly
- Build optimization completes successfully
- No broken imports or assets

### Manual Testing Checklist

- [ ] Hero section loads with animations
- [ ] Smooth scrolling works across all sections
- [ ] 3D effects respond to mouse movement
- [ ] Project cards display and filter correctly
- [ ] Contact form validation works
- [ ] All images load (check optimized versions)
- [ ] Mobile responsive layout functions properly
- [ ] Dark mode toggle works
- [ ] Navigation and routing function correctly

## 📂 Project Structure

```
portfolio/
├── public/                      # Static assets
│   ├── images/                  # Project images
│   │   ├── optimized/          # WebP/AVIF optimized images
│   │   └── projects/           # Project screenshots
│   ├── icons/                  # SVG icons
│   └── manifest.json           # PWA manifest
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── about/             # About page
│   │   ├── projects/          # Projects page
│   │   ├── skills/            # Skills page
│   │   ├── blog/              # Blog page
│   │   ├── contact/           # Contact page
│   │   ├── api/               # API routes
│   │   ├── layout.jsx         # Root layout
│   │   ├── page.jsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── aceternity/       # Aceternity UI components
│   │   ├── magicui/          # Magic UI components
│   │   ├── 3d/               # React Three Fiber components
│   │   ├── effects/          # Animation effects
│   │   └── projects/         # Project-specific components
│   │
│   ├── lib/                  # Utility functions
│   │   ├── animations/       # Animation utilities
│   │   └── utils.js          # Helper functions
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── useMousePosition.js
│   │
│   └── config/               # Configuration files
│       └── portfolio.json    # Portfolio data
│
├── scripts/                   # Build and utility scripts
│   ├── sync-github-projects.js      # Sync GitHub repos
│   ├── optimize-images.mjs          # Image optimization
│   ├── generate-fallback-data.js    # Generate fallback data
│   └── deploy-optimized-images.mjs  # Deploy optimized images
│
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile               # Docker configuration
├── next.config.mjs          # Next.js configuration
├── tailwind.config.mjs      # Tailwind CSS configuration
├── package.json             # Dependencies and scripts
└── pnpm-lock.yaml          # Lock file
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm sync-projects` | Sync GitHub projects |
| `pnpm sync-projects:dry` | Dry run project sync |
| `pnpm generate-fallback` | Generate fallback GitHub data |
| `pnpm preview` | Preview Cloudflare build |
| `pnpm deploy` | Deploy to Cloudflare |

## 🎨 Customization

### Update Portfolio Data

Edit `src/config/portfolio.json` to customize:

- Personal information
- Projects
- Skills
- Blog posts
- Social links
- Experience and education

### Modify Theme Colors

Update `tailwind.config.mjs` to customize the color palette:

```javascript
theme: {
  extend: {
    colors: {
      // Add your custom colors
      primary: {...},
      secondary: {...},
    }
  }
}
```

### Add New Components

Follow the existing component structure:

1. Create component in appropriate directory
2. Use consistent naming conventions
3. Add animations using Framer Motion or GSAP
4. Ensure mobile responsiveness

## 🔧 Configuration

### GitHub Project Sync

The portfolio can automatically sync projects from GitHub:

```bash
# Sync projects with verbose output
pnpm sync-projects:dry

# Apply changes
pnpm sync-projects
```

Projects are stored in `github_downloads_Msparihar/` and metadata is updated in portfolio.json.

### Image Optimization

Optimize images for better performance:

```bash
# Optimize images (creates WebP/AVIF)
node scripts/optimize-images.mjs

# Deploy optimized images
node scripts/deploy-optimized-images.mjs
```

### EmailJS Setup

1. Create account at [EmailJS](https://www.emailjs.com/)
2. Create email service and template
3. Add credentials to `.env.local`
4. Test contact form

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Msparihar/portfolio)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Cloudflare Pages

```bash
# Build for Cloudflare
pnpm cf-build

# Deploy
pnpm deploy
```

### Self-Hosted (Docker)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access logs
docker-compose logs -f
```

## 🎯 Performance Optimizations

- ✅ Image optimization (WebP, AVIF)
- ✅ Code splitting and lazy loading
- ✅ Font optimization with next/font
- ✅ Dynamic imports for heavy components
- ✅ SSR disabled for 3D components
- ✅ GPU-accelerated animations
- ✅ Proper cleanup of animation instances
- ✅ Optimized bundle size

## 🔍 SEO Features

- ✅ Dynamic metadata generation
- ✅ Sitemap generation
- ✅ Robots.txt configuration
- ✅ OpenGraph tags
- ✅ Twitter Card tags
- ✅ Structured data (JSON-LD)
- ✅ Semantic HTML
- ✅ Fast page load times

## 🐛 Troubleshooting

### Build Permission Error

If you encounter permission issues with `.next/trace`:

```bash
# Clean build directory
rm -rf .next
pnpm build
```

### 3D Components Not Rendering

Ensure WebGL is supported in your browser and update graphics drivers.

### Images Not Loading

Check that optimized images exist:

```bash
node scripts/optimize-images.mjs
```

### Contact Form Not Working

Verify EmailJS configuration in `.env.local` and check browser console for errors.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Manish Singh Parihar**

- Full Stack & AI Engineer
- GitHub: [@Msparihar](https://github.com/Msparihar)
- LinkedIn: [manishsparihar](https://www.linkedin.com/in/manishsparihar/)
- Twitter: [@manishs_parihar](https://x.com/manishs_parihar)
- Website: [manishsingh.tech](https://manishsingh.tech)

## 🙏 Acknowledgments

- [Aceternity UI](https://ui.aceternity.com/) - Beautiful UI components
- [Magic UI](https://magicui.design/) - Animated components
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Vercel](https://vercel.com/) - Hosting and deployment
- [Next.js](https://nextjs.org/) - React framework

## 📞 Contact

For questions, suggestions, or collaboration opportunities:

- Email: <manishsparihar@gmail.com>
- Website: <https://manishsingh.tech>
- GitHub Issues: [Create an issue](https://github.com/Msparihar/portfolio/issues)

---

<div align="center">
  <strong>⭐ Star this repository if you find it helpful!</strong>
  <br><br>
  Made with ❤️ by <a href="https://github.com/Msparihar">Manish Singh Parihar</a>
</div>
