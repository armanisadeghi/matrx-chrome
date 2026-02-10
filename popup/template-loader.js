// Template loading utility for Matrx Chrome Extension
class TemplateLoader {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Load and process a template with data substitution
     * @param {string} templateName - Name of the template file (without .html)
     * @param {Object} data - Data to substitute in template
     * @returns {Promise<string>} Processed HTML content
     */
    async loadTemplate(templateName, data = {}) {
        try {
            // Check cache first
            const cacheKey = `${templateName}`;
            let template = this.cache.get(cacheKey);
            
            if (!template) {
                // Load template from file
                const templateUrl = chrome.runtime.getURL(`templates/${templateName}.html`);
                const response = await fetch(templateUrl);
                
                if (!response.ok) {
                    throw new Error(`Failed to load template: ${templateName}`);
                }
                
                template = await response.text();
                this.cache.set(cacheKey, template);
            }
            
            // Process template with data
            return this.processTemplate(template, data);
            
        } catch (error) {
            console.error(`Error loading template ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Process template by substituting placeholders with data
     * @param {string} template - Template HTML string
     * @param {Object} data - Data to substitute
     * @returns {string} Processed HTML
     */
    processTemplate(template, data) {
        let processed = template;
        
        // Handle shared styles inclusion
        if (processed.includes('../templates/shared-styles.html')) {
            // For blob URLs, we need to inline the styles
            processed = processed.replace(
                '<link rel="stylesheet" href="../templates/shared-styles.html">',
                '<!-- Shared styles will be inlined by template loader -->'
            );
        }
        
        // Simple template substitution
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            
            // Handle different value types
            if (typeof value === 'string') {
                // For JSON placeholders, keep as-is (already stringified)
                if (key.includes('Json')) {
                    processed = processed.replace(new RegExp(placeholder, 'g'), value);
                } else if (key.includes('Content') && !key.includes('Html')) {
                    // Check if this placeholder is inside a script tag
                    const scriptRegex = new RegExp(`<script[^>]*>[\\s\\S]*?${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?</script>`, 'g');
                    if (scriptRegex.test(processed)) {
                        // Escape for JavaScript if inside script tags
                        value = this.escapeJavaScript(value);
                    } else {
                        // Escape HTML for content that should be displayed as text
                        value = this.escapeHtml(value);
                    }
                    processed = processed.replace(new RegExp(placeholder, 'g'), value);
                } else {
                    processed = processed.replace(new RegExp(placeholder, 'g'), value);
                }
            } else if (typeof value === 'object') {
                // For JSON data, stringify it
                processed = processed.replace(new RegExp(placeholder, 'g'), JSON.stringify(value));
            } else {
                processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
            }
        });
        
        return processed;
    }

    /**
     * Escape HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Escape JavaScript string
     * @param {string} text - Text to escape for JavaScript
     * @returns {string} Escaped JavaScript string
     */
    escapeJavaScript(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    /**
     * Parse simple markdown to HTML
     * @param {string} markdown - Markdown text
     * @returns {string} HTML
     */
    parseSimpleMarkdown(markdown) {
        let html = markdown;
        
        // Escape HTML first
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Headers
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Lists
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');
        
        // Paragraphs
        html = html.replace(/\n\s*\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1');
        html = html.replace(/<p>\s*(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
        
        return html;
    }

    /**
     * Load shared styles and inline them into template.
     * Includes the design system (theme.css + icons.css) and legacy shared-styles.
     * @returns {Promise<string>} Shared styles CSS
     */
    async getSharedStyles() {
        try {
            const parts = [];

            // Load design system tokens + components
            try {
                const themeUrl = chrome.runtime.getURL('styles/theme.css');
                const themeResp = await fetch(themeUrl);
                if (themeResp.ok) parts.push(await themeResp.text());
            } catch (_) { /* optional */ }

            try {
                const iconsUrl = chrome.runtime.getURL('styles/icons.css');
                const iconsResp = await fetch(iconsUrl);
                if (iconsResp.ok) parts.push(await iconsResp.text());
            } catch (_) { /* optional */ }

            // Load legacy shared-styles.html
            const stylesUrl = chrome.runtime.getURL('templates/shared-styles.html');
            const response = await fetch(stylesUrl);
            const stylesHtml = await response.text();
            const styleMatch = stylesHtml.match(/<style>([\s\S]*?)<\/style>/);
            if (styleMatch) parts.push(styleMatch[1]);

            return parts.join('\n');
        } catch (error) {
            console.error('Error loading shared styles:', error);
            return '';
        }
    }

    /**
     * Create a complete HTML document with inlined styles for blob URLs
     * @param {string} templateName - Template name
     * @param {Object} data - Template data
     * @returns {Promise<string>} Complete HTML document
     */
    async createBlobDocument(templateName, data = {}) {
        try {
            // Load the template
            let html = await this.loadTemplate(templateName, data);
            
            // Get shared styles and inline them
            const sharedStyles = await this.getSharedStyles();
            
            // Replace the shared styles placeholder with actual styles
            html = html.replace(
                '<!-- Shared styles will be inlined by template loader -->',
                `<style>${sharedStyles}</style>`
            );
            
            return html;
        } catch (error) {
            console.error(`Error creating blob document for ${templateName}:`, error);
            throw error;
        }
    }

    /**
     * Clear template cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export for use in popup.js
window.TemplateLoader = TemplateLoader;
