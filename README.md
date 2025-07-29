# FOODOPEDIA 🍎

<p align="center">
    <em>A smart and fast food product scanner that decodes nutrition data using barcodes</em>
</p>

<p align="center">
    <img src="https://img.shields.io/github/license/AdityaAtoZ/Foodopedia?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=ff9520" alt="license">
    <img src="https://img.shields.io/github/last-commit/AdityaAtoZ/Foodopedia?style=for-the-badge&logo=git&logoColor=white&color=ff9520" alt="last-commit">
    <img src="https://img.shields.io/github/languages/count/AdityaAtoZ/Foodopedia?style=for-the-badge&color=ff9520" alt="repo-language-count">
</p>

<p align="center">
    🌐 <strong><a href="https://foodopedia.vercel.app/app">Live Demo</a></strong> | 
    📖 <strong><a href="#getting-started">Getting Started</a></strong> | 
    🤝 <strong><a href="#contributing">Contributing</a></strong>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Technology Stack](#-technology-stack)
- [Project Roadmap](#-project-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

Foodopedia is a modern web application that transforms how you understand food products. Simply scan a barcode with your device's camera, and instantly access comprehensive nutrition information, health recommendations, and product insights. Built with Next.js and powered by real-time barcode detection, Foodopedia makes healthy eating decisions easier and more informed.

**Key Highlights:**
- ⚡ Lightning-fast barcode scanning
- 📊 Comprehensive nutrition analysis
- 🎨 Intuitive, color-coded health indicators
- 📱 Mobile-first responsive design
- 🔍 Smart product search capabilities

---

## 🚀 Features

### ✅ Currently Available

- **🔍 Advanced Barcode Scanning**
  - Real-time camera-based barcode detection
  - Support for multiple barcode formats
  - Fallback library for broader device compatibility

- **📊 Comprehensive Nutrition Display**
  - Detailed nutrition facts (calories, fats, carbs, proteins, etc.)
  - Color-coded health indicators (red, yellow, green)
  - Easy-to-understand nutrition scoring system

- **🍽 Smart Product Analysis**
  - Instant product recognition and summary
  - Ingredient breakdown and analysis
  - Additive identification and health impact

- **🧠 Intelligent Recommendations**
  - Related product suggestions
  - Health-conscious alternatives
  - Personalized nutrition insights

- **📱 Seamless User Experience**
  - Progressive Web App (PWA) capabilities
  - Offline functionality for scanned products
  - Cross-platform compatibility

### 🔮 Coming Soon

- **🧺 Smart Basket Feature** - Save and organize scanned products
- **🔐 User Authentication** - Personal accounts with sync capabilities
- **💾 Cloud Database Integration** - Real-time data with Supabase/Firebase
- **⚖️ Product Comparison Tool** - Side-by-side nutrition analysis
- **🤖 AI-Powered Recommendations** - Gemini API integration for smarter suggestions
- **📈 Health Tracking Dashboard** - Monitor daily nutrition intake
- **🏷️ Custom Product Lists** - Create and share curated food lists
- **🔔 Nutrition Alerts** - Personalized health notifications

---

## 📁 Project Structure

```
Foodopedia/
├── 📁 app/                    # Next.js App Directory
│   ├── 📁 (app)/             # Main application routes
│   │   └── 📁 app/           # Core app functionality
│   │       ├── 📁 components/    # Reusable UI components
│   │       ├── 📁 scan/          # Barcode scanning features
│   │       └── 📁 product/       # Product detail pages
│   ├── 📁 (home)/            # Landing page
│   ├── 📁 api/               # API routes
│   └── 📄 globals.css        # Global styles
├── 📁 constants/             # App constants and configurations
├── 📁 types/                 # TypeScript type definitions
├── 📁 utils/                 # Utility functions
├── 📁 prisma/                # Database schema
├── 📄 package.json           # Dependencies and scripts
└── 📄 README.md             # Project documentation
```

---

## 🛠 Getting Started

### Prerequisites

Ensure your development environment meets these requirements:

- **Node.js:** v18.0.0 or higher
- **npm:** v8.0.0 or higher
- **TypeScript:** v5.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdityaAtoZ/Foodopedia.git
   cd Foodopedia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize the database** (if using Prisma)
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## 🚀 Usage

### Development

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Production

Build and start the production server:
```bash
npm run build
npm start
```

### Testing

Run the test suite:
```bash
npm test
```

For watch mode:
```bash
npm run test:watch
```

---

## 🔧 Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom component library
- **State Management:** React Hooks

### Backend
- **API Routes:** Next.js API Routes
- **Database:** Prisma ORM
- **Authentication:** NextAuth.js (planned)

### External APIs
- **Nutrition Data:** Open Food Facts API
- **Barcode Detection:** Browser Barcode Detection API
- **AI Integration:** Google Gemini API (planned)

### Deployment
- **Platform:** Vercel
- **Domain:** [foodopedia.vercel.app](https://foodopedia.vercel.app)

---

## 🗺 Project Roadmap

### Phase 1: Core Features ✅
- [x] Barcode scanning functionality
- [x] Basic nutrition display
- [x] Product search capabilities
- [x] Responsive UI design

### Phase 2: Enhanced UX 🚧
- [ ] User authentication system
- [ ] Personal product basket
- [ ] Advanced filtering options
- [ ] Offline mode improvements

### Phase 3: Smart Features 📋
- [ ] AI-powered recommendations
- [ ] Product comparison tool
- [ ] Health tracking dashboard
- [ ] Social sharing capabilities

### Phase 4: Advanced Analytics 🔮
- [ ] Personalized nutrition insights
- [ ] Dietary goal tracking
- [ ] Integration with fitness apps
- [ ] Community features

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- **💬 [Join Discussions](https://github.com/AdityaAtoZ/Foodopedia/discussions)** - Share ideas and feedback
- **🐛 [Report Issues](https://github.com/AdityaAtoZ/Foodopedia/issues)** - Help us identify bugs and improvements
- **💡 [Submit Pull Requests](https://github.com/AdityaAtoZ/Foodopedia/pulls)** - Contribute code and features

### Development Guidelines

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YourUsername/Foodopedia.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features

4. **Commit Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push & Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for functions
- Ensure responsive design principles

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Special Thanks
- **Open Food Facts** - For providing comprehensive nutrition data
- **Vercel** - For seamless deployment and hosting
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework

### Contributors
<p align="center">
   <a href="https://github.com/AdityaAtoZ/Foodopedia/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=AdityaAtoZ/Foodopedia" />
   </a>
</p>

---

<p align="center">
    <strong>Made with ❤️ by <a href="https://github.com/AdityaAtoZ">Aditya</a></strong>
</p>

<p align="center">
    <a href="https://foodopedia.vercel.app">🌐 Visit Live App</a> • 
    <a href="https://github.com/AdityaAtoZ/Foodopedia/issues">🐛 Report Bug</a> • 
    <a href="https://github.com/AdityaAtoZ/Foodopedia/discussions">💬 Request Feature</a>
</p>
