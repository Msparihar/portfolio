# Portfolio Website - Manish Singh

A modern, terminal-themed portfolio website built with Next.js 15, showcasing projects, skills, and experience through an interactive command-line interface.

🌐 **Live Site**: [manishsingh.tech](https://manishsingh.tech)

## ✨ Features

### 🖥️ Terminal UI Experience
- **Interactive Terminal**: Navigate through portfolio sections using familiar command-line commands
- **Command System**: Support for `help`, `ls`, `cd`, `cat`, and custom commands
- **Compact Terminal**: Condensed terminal interface for specific sections
- **Real-time Command Processing**: Dynamic content updates based on terminal navigation

### 🎨 Modern Design & Animations
- **Dark Theme**: Sleek terminal-inspired design with custom styling
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Expandable Project Cards**: Click to view detailed project information in animated modals
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🚀 Performance Optimizations
- **Dynamic Imports**: Code splitting for optimal loading
- **Image Preloading**: Smart preloading system for faster navigation
- **Skeleton Loaders**: Enhanced UX during content loading
- **Server-side Caching**: GitHub API data caching for improved performance

### 📱 Interactive Components
- **Project Modals**: Detailed project views with tech stack categorization
- **GitHub Contributions**: Live GitHub activity visualization
- **Contact Forms**: Interactive contact section with social links
- **Copy-to-Clipboard**: Easy sharing of project URLs and contact information

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom terminal theme
- **Animations**: Framer Motion
- **UI Components**: Shadcn/ui, Radix UI primitives
- **Icons**: FontAwesome, Lucide React, React Icons
- **Theme**: next-themes with dark mode default

### Backend & APIs
- **GitHub API**: Real-time repository and contribution data
- **Caching**: Custom GitHub API caching system
- **Image Optimization**: Next.js built-in image optimization

### Development Tools
- **Package Manager**: bun
- **Build Tool**: Turbopack (for faster development builds)
- **Linting**: ESLint with Next.js configuration
- **Environment**: Node.js with ES modules

## 📁 Project Structure

```
src/
├── app/                    # App Router pages
├── components/             # Reusable components
│   ├── ui/                # Shadcn/ui components
│   ├── projects/          # Project-specific components
│   ├── blog/              # Blog components
│   └── contact/           # Contact components
├── config/                # Configuration files
│   └── portfolio.json     # Portfolio data
├── lib/                   # Utility functions
│   └── githubCache.js     # GitHub API caching
└── contexts/              # React contexts
    └── TerminalContext.jsx # Terminal state management

scripts/
└── sync-github-projects.js # GitHub repository sync script

public/                    # Static assets
└── projects/             # Project images and assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- bun (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Msparihar/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your GitHub token for API access
   ```

4. **Run the development server**
   ```bash
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

### Development
- `bun dev` - Start development server with Turbopack
- `bun build` - Build the application for production
- `bun start` - Start the production server
- `bun lint` - Run ESLint for code quality

### GitHub Sync
- `bun sync-projects` - Sync GitHub repositories (live mode)
- `bun sync-projects:dry` - Preview sync changes (dry-run mode)

## 🎮 Terminal Commands

The portfolio features an interactive terminal interface with the following commands:

- `help` - Show available commands
- `ls` - List available sections
- `cd [section]` - Navigate to a section (projects, blog, contact)
- `cat [file]` - Display section content
- `clear` - Clear terminal output
- `whoami` - Display developer information

## 🔧 Configuration

### Portfolio Data
All portfolio content is managed through `src/config/portfolio.json`:

```json
{
  "personal": {
    "name": "Manish Singh",
    "title": "Full Stack Developer",
    "bio": "Passionate developer with expertise in modern web technologies..."
  },
  "projects": [...],
  "skills": [...],
  "experience": [...]
}
```

### GitHub Integration
The site includes a GitHub repository sync script that:
- Fetches public repositories automatically
- Downloads README files and assets
- Manages local project cache
- Handles cleanup of private/deleted repositories

## 🎨 Customization

### Styling
- Tailwind CSS classes in components
- Custom CSS variables for terminal theme
- Responsive breakpoints and mobile-first design

### Components
- Modular component architecture
- Reusable UI components with Shadcn/ui
- Custom hooks for terminal functionality

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Bundle Size**: Optimized with dynamic imports and code splitting
- **Image Optimization**: Next.js Image component with lazy loading

## 🔒 Environment Variables

```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=your_github_username
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

**Manish Singh**
- Website: [manishsingh.tech](https://manishsingh.tech)
- Email: [contact@manishsingh.tech](mailto:contact@manishsingh.tech)
- GitHub: [@Msparihar](https://github.com/Msparihar)
- LinkedIn: [Connect with me](https://linkedin.com/in/manish-singh)

---

Built with ❤️ using Next.js and modern web technologies.