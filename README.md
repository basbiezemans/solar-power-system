# Solar Power System
App that helps you size a solar power system.

## Usage

### Build
```bash
npm run build         # Compile TypeScript to dist/
npm run build:watch   # Watch mode for development
```

### Testing
```bash
npm run test:run     # Run tests once
npm run test         # Watch mode for tests
npm run test:watch   # Continuous testing during development
```

### Running the Application
1. Serve the project with a local web server (e.g., `python -m http.server`)
2. Open `index.html` in a browser
3. The app loads compiled JS from `/dist/` directory

## Browser Compatibility
- ES2020 target
- Requires modern browser with ES module support
- jQuery 3.6.0 for DOM manipulation