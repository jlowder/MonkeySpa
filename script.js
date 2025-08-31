class WebappManager {
    constructor() {
        this.webapps = this.loadWebapps();
        this.currentEditId = null;
        this.pendingScreenshots = new Map(); // Track pending screenshot operations
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

        // Import/Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => this.openExportModal());
        document.getElementById('importBtn').addEventListener('click', () => this.openImportModal());
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportData('json'));
        document.getElementById('exportXmlBtn').addEventListener('click', () => this.exportData('xml'));
        document.getElementById('confirmImportBtn').addEventListener('click', () => this.importData());
        document.getElementById('cancelImportBtn').addEventListener('click', () => this.closeImportExportModal());

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => this.filterWebapps());
        document.getElementById('sortSelect').addEventListener('change', () => this.filterWebapps());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterWebapps());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                if (e.target.id === 'importExportModal') {
                    this.closeImportExportModal();
                } else {
                    this.closeModals();
                }
            }
        });
    }

    loadWebapps() {
        const stored = localStorage.getItem('webapps');
        const webapps = stored ? JSON.parse(stored) : [];
        console.log('LOAD: Loaded webapps from localStorage:', webapps.map(app => ({id: app.id, name: app.name, screenshotType: app.screenshot?.type})));
        return webapps;
    }

    saveWebapps() {
        console.log('Saving webapps to localStorage:', this.webapps.map(app => ({id: app.id, name: app.name, screenshotType: app.screenshot?.type})));
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
            console.log('MODAL: Setting currentEditId to:', this.currentEditId);
            console.log('MODAL: Webapp being edited:', webapp.name, webapp.id);
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
        fileInput.value = ''; // Clear any previous file selection
        
        // Clear screenshot input to prevent cross-contamination
        const screenshotInput = document.getElementById('appScreenshot');
        screenshotInput.value = '';
        
        console.log('FORM: Populated form for webapp:', webapp.name, webapp.id);
    }

    closeModals() {
        document.getElementById('appModal').style.display = 'none';
        document.getElementById('deleteModal').style.display = 'none';
        this.currentEditId = null;
    }

    closeImportExportModal() {
        document.getElementById('importExportModal').style.display = 'none';
    }

    openExportModal() {
        document.getElementById('importExportTitle').textContent = 'Export Data';
        document.getElementById('exportSection').style.display = 'block';
        document.getElementById('importSection').style.display = 'none';
        document.getElementById('importExportModal').style.display = 'block';
    }

    openImportModal() {
        document.getElementById('importExportTitle').textContent = 'Import Data';
        document.getElementById('exportSection').style.display = 'none';
        document.getElementById('importSection').style.display = 'block';
        document.getElementById('importFile').value = '';
        document.getElementById('importExportModal').style.display = 'block';
    }

    exportData(format) {
        try {
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                webapps: this.webapps.map(webapp => ({
                    ...webapp,
                    // Include metadata for import validation
                    exportedFrom: 'MonkeySpa'
                }))
            };

            let content, filename, mimeType;

            if (format === 'json') {
                content = JSON.stringify(exportData, null, 2);
                filename = `monkey-spa-export-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else if (format === 'xml') {
                content = this.convertToXML(exportData);
                filename = `monkey-spa-export-${new Date().toISOString().split('T')[0]}.xml`;
                mimeType = 'application/xml';
            }

            this.downloadFile(content, filename, mimeType);
            this.closeImportExportModal();
            this.showNotification(`Data exported successfully as ${format.toUpperCase()}!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export data. Please try again.', 'error');
        }
    }

    convertToXML(data) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<MonkeySpaExport>\n';
        xml += `  <version>${data.version}</version>\n`;
        xml += `  <exportDate>${data.exportDate}</exportDate>\n`;
        xml += '  <webapps>\n';
        
        data.webapps.forEach(webapp => {
            xml += '    <webapp>\n';
            xml += `      <id>${this.escapeXML(webapp.id)}</id>\n`;
            xml += `      <name>${this.escapeXML(webapp.name)}</name>\n`;
            xml += `      <description>${this.escapeXML(webapp.description || '')}</description>\n`;
            xml += `      <category>${this.escapeXML(webapp.category)}</category>\n`;
            xml += `      <fileName>${this.escapeXML(webapp.fileName)}</fileName>\n`;
            xml += `      <fileContent><![CDATA[${webapp.fileContent}]]></fileContent>\n`;
            xml += `      <dateAdded>${webapp.dateAdded}</dateAdded>\n`;
            xml += `      <lastUsed>${webapp.lastUsed || ''}</lastUsed>\n`;
            xml += `      <lastModified>${webapp.lastModified}</lastModified>\n`;
            xml += `      <usageCount>${webapp.usageCount || 0}</usageCount>\n`;
            xml += `      <exportedFrom>${this.escapeXML(webapp.exportedFrom)}</exportedFrom>\n`;
            
            if (webapp.tags && webapp.tags.length > 0) {
                xml += '      <tags>\n';
                webapp.tags.forEach(tag => {
                    xml += `        <tag>${this.escapeXML(tag)}</tag>\n`;
                });
                xml += '      </tags>\n';
            }
            
            if (webapp.screenshot) {
                xml += '      <screenshot>\n';
                xml += `        <type>${this.escapeXML(webapp.screenshot.type)}</type>\n`;
                if (webapp.screenshot.url) {
                    xml += `        <url><![CDATA[${webapp.screenshot.url}]]></url>\n`;
                }
                if (webapp.screenshot.title) {
                    xml += `        <title>${this.escapeXML(webapp.screenshot.title)}</title>\n`;
                }
                if (webapp.screenshot.preview) {
                    xml += `        <preview>${this.escapeXML(webapp.screenshot.preview)}</preview>\n`;
                }
                xml += '      </screenshot>\n';
            }
            
            xml += '    </webapp>\n';
        });
        
        xml += '  </webapps>\n';
        xml += '</MonkeySpaExport>';
        return xml;
    }

    escapeXML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async importData() {
        const fileInput = document.getElementById('importFile');
        const importMode = document.querySelector('input[name="importMode"]:checked').value;
        
        if (!fileInput.files[0]) {
            this.showNotification('Please select a file to import.', 'error');
            return;
        }

        const file = fileInput.files[0];
        const isJSON = file.name.toLowerCase().endsWith('.json');
        const isXML = file.name.toLowerCase().endsWith('.xml');
        
        if (!isJSON && !isXML) {
            this.showNotification('Please select a valid JSON or XML file.', 'error');
            return;
        }

        try {
            const content = await this.readFileContent(file);
            let importedData;

            if (isJSON) {
                importedData = JSON.parse(content);
            } else {
                importedData = this.parseXML(content);
            }

            // Validate imported data
            if (!this.validateImportData(importedData)) {
                this.showNotification('Invalid file format. Please select a valid Monkey Spa export file.', 'error');
                return;
            }

            // Process import based on mode
            if (importMode === 'replace') {
                this.webapps = importedData.webapps;
            } else {
                // Merge mode - avoid duplicates by ID
                const existingIds = new Set(this.webapps.map(app => app.id));
                const newWebapps = importedData.webapps.filter(app => !existingIds.has(app.id));
                this.webapps = [...this.webapps, ...newWebapps];
            }

            this.saveWebapps();
            this.renderWebapps();
            this.closeImportExportModal();
            
            const count = importedData.webapps.length;
            const mode = importMode === 'replace' ? 'replaced' : 'merged';
            this.showNotification(`Successfully ${mode} ${count} webapp(s)!`, 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Failed to import data. Please check the file format.', 'error');
        }
    }

    parseXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('Invalid XML format');
        }

        const exportData = {
            version: xmlDoc.querySelector('version')?.textContent || '1.0',
            exportDate: xmlDoc.querySelector('exportDate')?.textContent || new Date().toISOString(),
            webapps: []
        };

        const webappElements = xmlDoc.querySelectorAll('webapp');
        webappElements.forEach(webappEl => {
            const webapp = {
                id: webappEl.querySelector('id')?.textContent,
                name: webappEl.querySelector('name')?.textContent,
                description: webappEl.querySelector('description')?.textContent || '',
                category: webappEl.querySelector('category')?.textContent || 'other',
                fileName: webappEl.querySelector('fileName')?.textContent,
                fileContent: webappEl.querySelector('fileContent')?.textContent,
                dateAdded: webappEl.querySelector('dateAdded')?.textContent,
                lastUsed: webappEl.querySelector('lastUsed')?.textContent || null,
                lastModified: webappEl.querySelector('lastModified')?.textContent,
                usageCount: parseInt(webappEl.querySelector('usageCount')?.textContent) || 0,
                exportedFrom: webappEl.querySelector('exportedFrom')?.textContent
            };

            // Parse tags
            const tagElements = webappEl.querySelectorAll('tags tag');
            webapp.tags = Array.from(tagElements).map(tag => tag.textContent);

            // Parse screenshot
            const screenshotEl = webappEl.querySelector('screenshot');
            if (screenshotEl) {
                webapp.screenshot = {
                    type: screenshotEl.querySelector('type')?.textContent,
                    url: screenshotEl.querySelector('url')?.textContent,
                    title: screenshotEl.querySelector('title')?.textContent,
                    preview: screenshotEl.querySelector('preview')?.textContent
                };
            }

            exportData.webapps.push(webapp);
        });

        return exportData;
    }

    validateImportData(data) {
        return data && 
               data.webapps && 
               Array.isArray(data.webapps) &&
               data.webapps.every(webapp => 
                   webapp.id && 
                   webapp.name && 
                   webapp.fileContent
               );
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 4000);
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('appName').value.trim();
        const description = document.getElementById('appDescription').value.trim();
        const category = document.getElementById('appCategory').value;
        const tags = document.getElementById('appTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const fileInput = document.getElementById('appFile');
        const screenshotInput = document.getElementById('appScreenshot');

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
            if (this.currentEditId) {
                // Editing existing webapp - use dedicated method
                await this.updateExistingWebapp(this.currentEditId, name, description, category, tags, fileInput, screenshotInput);
            } else {
                // Adding new webapp - use dedicated method
                await this.addNewWebapp(name, description, category, tags, fileInput, screenshotInput);
            }
        } catch (error) {
            console.error('Error processing webapp:', error);
            alert('An error occurred while processing the webapp. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async updateExistingWebapp(webappId, name, description, category, tags, fileInput, screenshotInput) {
        console.log(`UPDATE: Starting update for webapp ${webappId}`);
        
        // Create a completely new webapp object to avoid any reference issues
        const originalWebapp = this.webapps.find(app => app.id === webappId);
        if (!originalWebapp) {
            console.error('UPDATE: Webapp not found:', webappId);
            return;
        }

        console.log('UPDATE: Original webapp:', originalWebapp.name, originalWebapp.screenshot?.type);

        // Deep clone the original webapp to avoid reference issues
        const updatedWebapp = JSON.parse(JSON.stringify(originalWebapp));
        updatedWebapp.name = name;
        updatedWebapp.description = description;
        updatedWebapp.category = category;
        updatedWebapp.tags = [...tags]; // Create new array
        updatedWebapp.lastModified = new Date().toISOString();

        console.log('UPDATE: Updated webapp object:', updatedWebapp.name, updatedWebapp.screenshot?.type);

        // Replace the webapp in the array using map to avoid index issues
        this.webapps = this.webapps.map(app => {
            if (app.id === webappId) {
                return updatedWebapp;
            }
            return app;
        });

        // Handle custom screenshot upload
        if (screenshotInput.files[0]) {
            console.log('UPDATE: Custom screenshot provided');
            const customScreenshot = await this.processCustomScreenshot(screenshotInput.files[0]);
            this.webapps = this.webapps.map(app => {
                if (app.id === webappId) {
                    return { ...app, screenshot: customScreenshot };
                }
                return app;
            });
        }

        // Handle file update ONLY if user actually selected a new file during this edit session
        console.log('UPDATE: Checking file input - files:', fileInput.files.length, 'value:', fileInput.value);
        if (fileInput.files[0] && fileInput.value !== '') {
            const file = fileInput.files[0];
            const fileContent = await this.readFileContent(file);
            
            // Cancel any pending screenshot for this webapp
            if (this.pendingScreenshots.has(webappId)) {
                this.pendingScreenshots.get(webappId).cancelled = true;
            }
            
            // Update the webapp using map to avoid index corruption
            this.webapps = this.webapps.map(app => {
                if (app.id === webappId) {
                    return {
                        ...app,
                        fileContent,
                        fileName: file.name,
                        screenshot: { type: 'loading' }
                    };
                }
                return app;
            });
            
            this.saveWebapps();
            this.renderWebapps();
            
            // Create new cancellation token
            const cancellationToken = { cancelled: false };
            this.pendingScreenshots.set(webappId, cancellationToken);
            
            // Generate new screenshot
            const screenshot = await this.generateScreenshot(fileContent);
            if (!cancellationToken.cancelled) {
                // Use map to avoid index issues
                this.webapps = this.webapps.map(app => {
                    if (app.id === webappId) {
                        return { ...app, screenshot };
                    }
                    return app;
                });
            }
            this.pendingScreenshots.delete(webappId);
        }

        const finalWebapp = this.webapps.find(app => app.id === webappId);
        console.log('UPDATE: Final webapp state:', finalWebapp?.name, finalWebapp?.screenshot?.type);
        this.saveWebapps();
        this.renderWebapps();
        this.closeModals();
    }

    async addNewWebapp(name, description, category, tags, fileInput, screenshotInput) {
        if (!fileInput.files[0]) {
            alert('Please select an HTML file');
            return;
        }

        const file = fileInput.files[0];
        const fileContent = await this.readFileContent(file);
        const webappId = this.generateId();

        const newWebapp = {
            id: webappId,
            name,
            description,
            category,
            tags,
            fileName: file.name,
            fileContent,
            screenshot: { type: 'loading' },
            dateAdded: new Date().toISOString(),
            lastUsed: null,
            lastModified: new Date().toISOString(),
            usageCount: 0
        };

        this.webapps.push(newWebapp);
        this.saveWebapps();
        this.renderWebapps();
        this.closeModals();

        // Handle custom screenshot if provided
        if (screenshotInput.files[0]) {
            console.log('NEW: Custom screenshot provided');
            const customScreenshot = await this.processCustomScreenshot(screenshotInput.files[0]);
            this.webapps = this.webapps.map(app => {
                if (app.id === webappId) {
                    return { ...app, screenshot: customScreenshot };
                }
                return app;
            });
            this.saveWebapps();
            this.renderWebapps();
            return; // Skip auto-generated screenshot
        }

        // Cancel any existing screenshot generation for this webapp
        if (this.pendingScreenshots.has(webappId)) {
            console.log(`ASYNC: Cancelling existing screenshot generation for ${webappId}`);
            this.pendingScreenshots.get(webappId).cancelled = true;
        }

        // Create cancellation token
        const cancellationToken = { cancelled: false };
        this.pendingScreenshots.set(webappId, cancellationToken);

        // Generate screenshot in background using ID lookup
        this.generateScreenshot(fileContent).then(screenshot => {
            // Check if this operation was cancelled
            if (cancellationToken.cancelled) {
                console.log(`ASYNC: Screenshot generation cancelled for webapp ${webappId}`);
                return;
            }

            console.log(`ASYNC: Setting screenshot for webapp ${webappId}`);
            console.log('ASYNC: Current webapps state:', this.webapps.map(app => ({id: app.id, name: app.name})));
            
            // Use map to create a new array with the updated webapp
            this.webapps = this.webapps.map(app => {
                if (app.id === webappId) {
                    console.log(`ASYNC: Found target webapp: ${app.name} (ID: ${app.id}), updating screenshot`);
                    console.log('ASYNC: Screenshot being applied to:', app.name);
                    return { ...app, screenshot };
                }
                return app;
            });
            
            this.saveWebapps();
            this.renderWebapps();
            
            // Clean up cancellation token
            this.pendingScreenshots.delete(webappId);
        }).catch(error => {
            console.error('Screenshot generation failed:', error);
            this.pendingScreenshots.delete(webappId);
        });
    }

    async processCustomScreenshot(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    type: 'image',
                    url: e.target.result,
                    title: 'Custom Screenshot'
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
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
                // Increased delay to ensure full page rendering (CSS, images, etc.)
                setTimeout(() => {
                    html2canvas(iframe.contentDocument.documentElement, {
                        width: 1024,
                        height: 768,
                        scale: 0.5,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: null,
                        foreignObjectRendering: false,
                        logging: false,
                        removeContainer: true,
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 1024,
                        windowHeight: 768
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
                }, 2000); // Wait 2 seconds for content to render
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
        // Update usage statistics using map to avoid reference issues
        this.webapps = this.webapps.map(app => {
            if (app.id === webapp.id) {
                return {
                    ...app,
                    lastUsed: new Date().toISOString(),
                    usageCount: (app.usageCount || 0) + 1
                };
            }
            return app;
        });
        
        this.saveWebapps();
        this.renderWebapps(); // Re-render to show updated "last used" time

        // Create a new window/tab with the webapp content
        const newWindow = window.open('', '_blank');
        newWindow.document.write(webapp.fileContent);
        newWindow.document.close();
    }

    editWebapp(webapp) {
        console.log('EDIT: Opening edit modal for webapp:', webapp.id, webapp.name);
        console.log('EDIT: Webapp screenshot type:', webapp.screenshot?.type);
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
