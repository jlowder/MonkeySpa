# MonkeySpa Sample Applications

This directory contains 9 standalone HTML5 web applications that demonstrate various frontend development techniques and technologies. Each app is self-contained with no external dependencies beyond standard web APIs.

## Sample Applications

### 1. Calculator

A scientific calculator with a modern, intuitive interface featuring a soft-shadow 3D design.

**Key Features:**
- Basic arithmetic operations (add, subtract, multiply, divide)
- Scientific functions (sin, cos, tan, log, ln, sqrt, factorial)
- Constants (π, e)
- Exponentiation support
- Keyboard input support
- Error handling

**Technology Stack:**
- Vanilla JavaScript
- CSS Grid layout
- Modern gradient styling
- Keyboard event handling

---

### 2. Color Picker

An interactive color selection tool that generates colors in multiple formats with preset options.

**Key Features:**
- RGB slider controls for Red, Green, and Blue values
- Real-time color preview
- Multiple output formats (HEX, RGB, HSL)
- Preset color palette
- Copy-to-clipboard functionality
- Smooth animations

**Technology Stack:**
- Vanilla JavaScript
- CSS Grid layout
- Color space conversion algorithms (RGB to HEX, RGB to HSL)
- Clipboard API

---

### 3. Minesweeper

A classic minesweeper game with multiple difficulty levels and responsive design.

**Key Features:**
- Three difficulty presets (Beginner, Intermediate, Expert)
- Custom difficulty configuration
- First-click safety (mines placed after initial click)
- Timer and mine counter
- Flag placement with right-click
- Chord feature (auto-reveal when flags match adjacent mines)
- Best time tracking per difficulty
- Win/loss celebration effects
- Responsive grid sizing

**Technology Stack:**
- Vanilla JavaScript (ES6+ classes)
- CSS Grid layout
- Recursive flood-fill algorithm
- Local storage for high scores
- Haptic feedback support

---

### 4. Pomodoro Timer

A productivity timer implementing the Pomodoro technique with customizable cycles.

**Key Features:**
- Work/break cycle management (25min work, 5min short break, 15min long break)
- Configurable cycle durations
- Session counter and statistics
- Timer state visualization with color-coded themes
- Audio notifications with multiple sound options
- Progress bar
- Local storage for settings

**Technology Stack:**
- Vanilla JavaScript
- Web Audio API for notifications
- CSS animations and transitions
- Local storage for persistence

---

### 5. Quantum Pass

A secure password generator with customizable length and character options.

**Key Features:**
- Configurable password length (6-32 characters)
- Toggle options for uppercase, lowercase, numbers, and symbols
- Real-time password strength meter
- Copy-to-clipboard functionality
- Secure random generation
- Visual feedback for strength levels

**Technology Stack:**
- Vanilla JavaScript
- Math.random() based random generation
- CSS transitions and animations
- Clipboard API

---

### 6. Slide Puzzle

A classic 15-puzzle game with customizable display options and animations.

**Key Features:**
- 4x4 grid puzzle
- Smooth tile sliding animations
- Move counter
- Timer functionality
- Pause/resume capability
- Shuffle with guaranteed solvability
- Customizable tile colors (odd/even number colors)
- Toggle display of timer and move counter
- Win celebration effects

**Technology Stack:**
- Vanilla JavaScript (ES6+ classes)
- CSS transforms and transitions
- Local storage for settings
- Grid-based game logic

---

### 7. Todo App

A task management application with localStorage persistence and statistics.

**Key Features:**
- Add, edit, and delete tasks
- Mark tasks as completed
- Task statistics (total, completed, pending)
- LocalStorage persistence
- Keyboard input support (Enter to add)
- Empty state with helpful messaging

**Technology Stack:**
- Vanilla JavaScript
- LocalStorage API
- Event delegation
- Dynamic DOM manipulation

---

### 8. API Tester

A comprehensive API testing tool supporting multiple HTTP methods and request types.

**Key Features:**
- Support for GET, POST, PUT, DELETE, PATCH methods
- Custom headers management
- Request body editor with JSON formatting
- Response viewing with tabs (Body, Headers, Raw)
- Request history with localStorage
- Dark/light theme toggle
- Response time and size metrics
- Copy response functionality
- CORS warning banner

**Technology Stack:**
- Vanilla JavaScript
- Fetch API for HTTP requests
- Web Storage API
- CSS custom properties (variables)
- Responsive grid layout

---

### 9. IP Geo Lookup

An IP address geolocation tool that displays location information on an interactive map.

**Key Features:**
- Auto-detect current IP address
- Manual IP address lookup
- Location information (country, region, city)
- GPS coordinates display
- Copy coordinates functionality
- Interactive map using Leaflet.js
- Loading states and error handling
- Responsive card-based layout

**Technology Stack:**
- Vanilla JavaScript
- Leaflet.js for mapping
- ipinfo.io API for geolocation
- CSS Grid and Flexbox
- CSS backdrop filters
- Fetch API

---

## Development Notes

### Browser Compatibility

All sample apps are designed to work with modern browsers:
- Chrome 91+
- Firefox 89+
- Edge 91+
- Safari 14.1+

### File Structure

Each sample app is contained within a single HTML file with:
- HTML5 document structure
- Embedded CSS for styling
- Inline JavaScript for functionality
- No external dependencies (except API Tester and IP Geo Lookup which use CDN libraries)

### Best Practices Demonstrated

- Semantic HTML5 markup
- CSS custom properties for theming
- Responsive design principles
- Accessibility considerations
- Modern JavaScript (ES6+) features
- LocalStorage for data persistence
- Event delegation patterns
- Object-oriented JavaScript where appropriate

---

## License

These sample applications are provided as-is for educational and demonstration purposes.