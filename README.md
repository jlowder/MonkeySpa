# Monkey Spa - Webapp Manager

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Browsers](https://img.shields.io/badge/Browsers-Chrome%2091%2B%20%7C%20Firefox%2089%2B%20%7C%20Edge%2091%2B%20%7C%20Safari%2014.1%2B-green?logo=google-chrome)](https://en.wikipedia.org/wiki/Web_browser)
[![Standalone](https://img.shields.io/badge/Standalone-Yes-green?logo=web-app)](https://en.wikipedia.org/wiki/Standalone_web_application)
[![Client-Side](https://img.shields.io/badge/Client--Side-Only-blue?logo=javascript)](https://developer.mozilla.org/en-US/docs/Glossary/Client-side)
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-green)](https://en.wikipedia.org/wiki/Dependency_(software))
[![IndexedDB](https://img.shields.io/badge/IndexedDB-Storage-blue?logo=mozilla)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB)

A modern, responsive web application for managing your collection of single-page HTML webapps. Features a beautiful grid interface with metadata tracking, search capabilities, automatic screenshot generation, and easy webapp launching.

![Monkey Spa Interface](screenshot.png)

## Features

- **Grid View Interface**: Clean, modern card-based layout showing webapp previews
- **Automatic Screenshots**: Auto-generated previews of your webapps using html2canvas
- **Manual Screenshot Upload**: Option to upload custom screenshots for better quality
- **Metadata Management**: Track name, description, category, tags, usage statistics, and dates
- **Search & Filter**: Find webapps by name, description, or tags with category filtering
- **CRUD Operations**: Add, edit, and delete webapps with intuitive modals
- **Import/Export**: Backup and share webapp collections in JSON or XML format
- **Usage Tracking**: Monitor when webapps were last used and usage frequency
- **IndexedDB Storage**: All data persisted locally using IndexedDB, supporting significantly more webapps and larger file sizes than localStorage
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradients, smooth animations, and professional styling

## Getting Started

1. Open `monkey-spa.html` in your web browser
2. Click "Add Webapp" to add your first single-page HTML application. Samples included.
3. Fill in the details and upload your HTML file
4. Your webapp will appear in the grid with a preview card
5. Click on any webapp card to launch it in a new window

## Usage

### Adding Webapps
- Click the "Add Webapp" button
- Enter a name and description
- Select a category (Dev Tools, Research, Productivity, Utilities, Fun, Other)
- Add comma-separated tags for better organization
- Upload your HTML file
- Optionally upload a custom screenshot (otherwise one will be auto-generated)
- Click "Save Webapp"

### Managing Webapps
- **Launch**: Click anywhere on a webapp card to open it
- **Edit**: Hover over a card and click the edit icon
- **Delete**: Hover over a card and click the delete icon

### Search & Organization
- Use the search bar to find webapps by name, description, or tags
- Filter by category using the dropdown
- Sort by date added, name, or last used

### Import & Export
- **Export**: Click "Export" to download your webapp collection
  - Choose JSON or XML format
  - Includes all webapp data, screenshots, and metadata
  - Automatic filename generation with timestamps
- **Import**: Click "Import" to restore or merge webapp collections
  - Support for both JSON and XML files
  - Choose "Merge" to add new webapps or "Replace" to overwrite all
  - Duplicate prevention by webapp ID

Note that since all apps are serialized into the exported file, this
makes it easy to transfer your entire app collection to other systems
with a single file.

## Sample Webapps

The `samples/` directory contains **nine** comprehensive example webapps that demonstrate various frontend development techniques and technologies. Each app is a standalone single-page application with no external dependencies beyond standard web APIs.

### Sample Apps Overview

| # | App Name | Description |
|---|----------|-------------|
| 1 | [Calculator](samples/README.md#1-calculator) | Scientific calculator with keyboard support |
| 2 | [Color Picker](samples/README.md#2-color-picker) | RGB/HEX/HSL color generator with presets |
| 3 | [Minesweeper](samples/README.md#3-minesweeper) | Classic game with difficulty levels and timer |
| 4 | [Pomodoro Timer](samples/README.md#4-pomodoro-timer) | Productivity tool with work/break cycles |
| 5 | [Quantum Pass](samples/README.md#5-quantum-pass) | Password generator with strength meter |
| 6 | [Slide Puzzle](samples/README.md#6-slide-puzzle) | 15-puzzle game with animations |
| 7 | [Todo App](samples/README.md#7-todo-app) | Task manager with localStorage |
| 8 | [API Tester](samples/README.md#8-api-tester) | HTTP request tool with multiple methods |
| 9 | [IP Geo Lookup](samples/README.md#9-ip-geo-lookup) | Location finder with interactive map |

### Detailed Documentation

For detailed documentation of each sample app including key features and technology stack, please refer to the **[samples/README.md](samples/README.md)** file.

### Adding Sample Webapps

You can add any of these sample webapps to test the manager functionality:

1. Open `monkey-spa.html` in your browser
2. Click "Add Webapp"
3. Fill in the details (name, description, category)
4. Upload the HTML file from the `samples/` directory
5. Click "Save Webapp"

Each sample app demonstrates different frontend technologies:
- Vanilla JavaScript with modern ES6+ features
- CSS Grid and Flexbox layouts
- LocalStorage and IndexedDB for data persistence
- Web Audio API for notifications
- Fetch API for HTTP requests
- Canvas and DOM manipulation for games
- Third-party libraries (Leaflet.js for mapping)

## Technical Details

### Data Storage
- All webapp metadata is stored in browser IndexedDB
- HTML file contents are stored as text within the webapp data
- No server required - everything runs client-side

### Browser Compatibility
- Modern browsers with ES6+ support
- IndexedDB support required
- File API support for HTML file uploads

## Customization

The system is designed to be easily customizable:

- **Styling**: Modify `styles.css` to change colors, layouts, or animations
- **Categories**: Edit the category options in both HTML and JavaScript files
- **Metadata**: Add new fields by updating the webapp data structure
- **Features**: Extend functionality by modifying `script.js`

## Security Notes

- All webapps run in new browser windows/tabs
- No server-side processing - everything is client-side
- HTML content is stored as-is without sanitization
- Only use trusted HTML files from known sources

## License

This project is open source and available under the MIT License.

---

## Sample Applications License

The sample applications in the `samples/` directory are provided as-is for educational and demonstration purposes. They are also open source and available under the MIT License.
