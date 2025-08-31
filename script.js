class WebappManager {
    constructor() {
        this.webapps = this.loadWebapps();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderWebapps();
    }

    bindEvents() {
        // Modal controls
        document.getElementById('addAppBtn').addEventListener('click', () => this.openModal());
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeModals());
        });
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModals());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeModals());

        // Form submission
        document.getElementById('appForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => this.filterWebapps());
        document.getElementById('sortSelect').addEventListener('change', () => this.filterWebapps());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterWebapps());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    loadWebapps() {
        const stored = localStorage.getItem('webapps');
        return stored ? JSON.parse(stored) : [];
    }

    saveWebapps() {
        localStorage.setItem('webapps', JSON.stringify(this.webapps));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    openModal(webapp = null) {
        const modal = document.getElementById('appModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('appForm');

        if (webapp) {
            title.textContent = 'Edit Webapp';
            this.currentEditId = webapp.id;
            this.populateForm(webapp);
        } else {
            title.textContent = 'Add New Webapp';
            this.currentEditId = null;
            form.reset();
        }

        modal.style.display = 'block';
    }

    populateForm(webapp) {
        document.getElementById('appName').value = webapp.name;
        document.getElementById('appDescription').value = webapp.description || '';
        document.getElementById('appCategory').value = webapp.category || 'other';
        document.getElementById('appTags').value = webapp.tags ? webapp.tags.join(', ') : '';
        
        // Note: File input cannot be pre-populated for security reasons
        const fileInput = document.getElementById('appFile');
        fileInput.removeAttribute('required');
    }

    closeModals() {
        document.getElementById('appModal').style.display = 'none';
        document.getElementById('deleteModal').style.display = 'none';
        this.currentEditId = null;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('appName').value.trim();
        const description = document.getElementById('appDescription').value.trim();
        const category = document.getElementById('appCategory').value;
        const tags = document.getElementById('appTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const fileInput = document.getElementById('appFile');

        if (!name) {
            alert('Please enter a webapp name');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            let webapp;
            if (this.currentEditId) {
                // Editing existing webapp
                webapp = this.webapps.find(app => app.id === this.currentEditId);
                webapp.name = name;
                webapp.description = description;
                webapp.category = category;
                webapp.tags = tags;
                webapp.lastModified = new Date().toISOString();
            } else {
                // Adding new webapp
                if (!fileInput.files[0]) {
                    alert('Please select an HTML file');
                    return;
                }

                const file = fileInput.files[0];
                const fileContent = await this.readFileContent(file);

                // Create webapp with temporary data first
                webapp = {
                    id: this.generateId(),
                    name,
                    description,
                    category,
                    tags,
                    fileName: file.name,
                    fileContent,
                    screenshot: { type: 'loading' }, // Temporary loading state
                    dateAdded: new Date().toISOString(),
                    lastUsed: null,
                    lastModified: new Date().toISOString(),
                    usageCount: 0
                };

                this.webapps.push(webapp);
                this.saveWebapps();
                this.renderWebapps();
                this.closeModals();

                // Generate screenshot in background
                this.generateScreenshot(fileContent).then(screenshot => {
                    webapp.screenshot = screenshot;
                    this.saveWebapps();
                    this.renderWebapps();
                });

                return; // Exit early for new webapps
            }

            // Handle file update for existing webapp
            if (this.currentEditId && fileInput.files[0]) {
                const file = fileInput.files[0];
                webapp.fileContent = await this.readFileContent(file);
                webapp.fileName = file.name;
                
                // Show loading state for screenshot update
                webapp.screenshot = { type: 'loading' };
                this.saveWebapps();
                this.renderWebapps();
                
                // Generate new screenshot
                webapp.screenshot = await this.generateScreenshot(webapp.fileContent);
            }

            this.saveWebapps();
            this.renderWebapps();
            this.closeModals();
        } catch (error) {
            console.error('Error processing webapp:', error);
            alert('An error occurred while processing the webapp. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async generateScreenshot(htmlContent) {
        return new Promise((resolve) => {
            // Create a hidden iframe to render the HTML content
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.width = '1024px';
            iframe.style.height = '768px';
            iframe.style.border = 'none';
            
            document.body.appendChild(iframe);
            
            // Write the HTML content to the iframe
            iframe.contentDocument.open();
            iframe.contentDocument.write(htmlContent);
            iframe.contentDocument.close();
            
            // Wait for content to load, then capture screenshot
            iframe.onload = () => {
                setTimeout(() => {
                    html2canvas(iframe.contentDocument.body, {
                        width: 1024,
                        height: 768,
                        scale: 0.5,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff'
                    }).then(canvas => {
                        const screenshot = canvas.toDataURL('image/png');
                        document.body.removeChild(iframe);
                        
                        resolve({
                            type: 'image',
                            url: screenshot,
                            title: this.extractTitle(htmlContent)
                        });
                    }).catch(error => {
                        console.warn('Screenshot generation failed:', error);
                        document.body.removeChild(iframe);
                        
                        // Fallback to text preview
                        resolve({
                            type: 'text',
                            title: this.extractTitle(htmlContent),
                            preview: htmlContent.substring(0, 200) + '...'
                        });
                    });
                }, 1000); // Wait 1 second for content to render
            };
            
            // Fallback if iframe fails to load
            iframe.onerror = () => {
                document.body.removeChild(iframe);
                resolve({
                    type: 'text',
                    title: this.extractTitle(htmlContent),
                    preview: htmlContent.substring(0, 200) + '...'
                });
            };
        });
    }

    extractTitle(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        return doc.querySelector('title')?.textContent || 'Untitled Webapp';
    }

    launchWebapp(webapp) {
        // Update usage statistics
        webapp.lastUsed = new Date().toISOString();
        webapp.usageCount = (webapp.usageCount || 0) + 1;
        this.saveWebapps();

        // Create a new window/tab with the webapp content
        const newWindow = window.open('', '_blank');
        newWindow.document.write(webapp.fileContent);
        newWindow.document.close();
    }

    editWebapp(webapp) {
        this.openModal(webapp);
    }

    deleteWebapp(webapp) {
        this.webappToDelete = webapp;
        document.getElementById('deleteModal').style.display = 'block';
    }

    confirmDelete() {
        if (this.webappToDelete) {
            this.webapps = this.webapps.filter(app => app.id !== this.webappToDelete.id);
            this.saveWebapps();
            this.renderWebapps();
            this.webappToDelete = null;
        }
        this.closeModals();
    }

    filterWebapps() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const sortBy = document.getElementById('sortSelect').value;
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filtered = this.webapps.filter(webapp => {
            const matchesSearch = !searchTerm || 
                webapp.name.toLowerCase().includes(searchTerm) ||
                webapp.description?.toLowerCase().includes(searchTerm) ||
                webapp.tags?.some(tag => tag.toLowerCase().includes(searchTerm));

            const matchesCategory = !categoryFilter || webapp.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'lastUsed':
                    const aLastUsed = a.lastUsed || '0';
                    const bLastUsed = b.lastUsed || '0';
                    return new Date(bLastUsed) - new Date(aLastUsed);
                case 'dateAdded':
                default:
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });

        this.renderWebapps(filtered);
    }

    renderWebapps(webappsToRender = null) {
        const grid = document.getElementById('webappGrid');
        const emptyState = document.getElementById('emptyState');
        const webapps = webappsToRender || this.webapps;

        if (webapps.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = webapps.map(webapp => this.createWebappCard(webapp)).join('');

        // Bind events for the newly created cards
        webapps.forEach(webapp => {
            const card = document.querySelector(`[data-id="${webapp.id}"]`);
            const launchArea = card.querySelector('.webapp-screenshot, .webapp-info');
            const editBtn = card.querySelector('.edit');
            const deleteBtn = card.querySelector('.delete');

            launchArea.addEventListener('click', (e) => {
                if (!e.target.closest('.webapp-actions')) {
                    this.launchWebapp(webapp);
                }
            });

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editWebapp(webapp);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteWebapp(webapp);
            });
        });
    }

    createWebappCard(webapp) {
        const formatDate = (dateString) => {
            if (!dateString) return 'Never';
            return new Date(dateString).toLocaleDateString();
        };

        const getCategoryColor = (category) => {
            const colors = {
                productivity: '#48bb78',
                games: '#ed8936',
                utilities: '#4299e1',
                entertainment: '#9f7aea',
                other: '#667eea'
            };
            return colors[category] || colors.other;
        };

        return `
            <div class="webapp-card" data-id="${webapp.id}">
                <div class="webapp-screenshot ${webapp.screenshot?.type === 'loading' ? 'loading' : ''}">
                    ${webapp.screenshot?.type === 'image' 
                        ? `<img src="${webapp.screenshot.url}" alt="${webapp.name} screenshot">` 
                        : webapp.screenshot?.type === 'loading'
                        ? `<div class="loading-spinner"></div><div class="loading-text">Generating screenshot...</div>`
                        : `<i class="fas fa-code placeholder-icon"></i>`
                    }
                </div>
                <div class="webapp-info">
                    <div class="webapp-title">
                        ${webapp.name}
                        <div class="webapp-actions">
                            <button class="action-btn edit" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${webapp.description ? `<div class="webapp-description">${webapp.description}</div>` : ''}
                    <div class="webapp-meta">
                        <span class="webapp-category" style="background-color: ${getCategoryColor(webapp.category)}">
                            ${webapp.category}
                        </span>
                        <span>Added: ${formatDate(webapp.dateAdded)}</span>
                    </div>
                    <div class="webapp-meta">
                        <span>Last used: ${formatDate(webapp.lastUsed)}</span>
                        <span>Uses: ${webapp.usageCount || 0}</span>
                    </div>
                    ${webapp.tags && webapp.tags.length > 0 ? `
                        <div class="webapp-tags">
                            ${webapp.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

// Initialize the webapp manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WebappManager();
});
