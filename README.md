
# Wildfire Risk Monitoring Project

## Getting Started with Git

### 1. Initialize Git Repository
```sh
git init
```

### 2. Add Your GitHub Repository as Remote
```sh
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

### 3. Add Files to Git
```sh
# Add all files
git add .

# Or add specific files
git add src/ public/ index.html
```

### 4. Create Initial Commit
```sh
git commit -m "Initial commit: Wildfire Risk Monitoring Project"
```

### 5. Push to GitHub
```sh
# Push to main branch
git push -u origin main
```

## Project Setup After Cloning

```sh
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Navigate to project directory
cd wildfire-risk-monitoring

# Install dependencies
npm install

# Start development server
npm run dev
```

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Git

## Project Technologies

- React with TypeScript
- Leaflet Maps for interactive mapping
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data fetching

## Features

- Real-time wildfire monitoring
- Risk level visualization by district
- Interactive map with incident markers
- Weather information display
- Responsive design

## Development

To start developing:

```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Deployment

Deploy through your preferred hosting platform. Make sure to:

1. Build the project: `npm run build`
2. Test the build locally: `npm run preview`
3. Deploy the `dist` folder to your hosting service

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

