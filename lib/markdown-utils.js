/**
 * Centralized Markdown Utility for Matrx Extension
 * Provides consistent markdown rendering across all extension components
 */

class MarkdownUtils {
    constructor() {
        this.isReady = false;
        this.librariesLoaded = false;
    }

    /**
     * Initialize and validate markdown libraries
     * @returns {boolean} True if libraries are available
     */
    init() {
        if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
            // Configure marked.js for optimal rendering
            marked.setOptions({
                breaks: true,        // Convert line breaks to <br>
                gfm: true,          // GitHub Flavored Markdown
                headerIds: true,    // Add IDs to headers
                sanitize: false,    // We'll use DOMPurify for sanitization
                smartypants: true,  // Use smart quotes and dashes
                pedantic: false,    // Don't be too strict about markdown spec
                silent: false       // Show warnings in console
            });
            
            this.isReady = true;
            this.librariesLoaded = true;
            console.log('✅ Markdown utilities initialized successfully');
            return true;
        } else {
            console.warn('⚠️ Markdown libraries not available:', {
                marked: typeof marked,
                DOMPurify: typeof DOMPurify
            });
            return false;
        }
    }

    /**
     * Convert markdown to HTML with sanitization
     * @param {string} markdownContent - The markdown content to convert
     * @returns {string} Sanitized HTML string
     */
    toHTML(markdownContent) {
        if (!markdownContent) return '';
        
        try {
            if (this.isReady) {
                // Parse markdown to HTML
                const rawHtml = marked.parse(markdownContent);
                
                // Sanitize HTML with comprehensive allowed tags
                const cleanHtml = DOMPurify.sanitize(rawHtml, {
                    ALLOWED_TAGS: [
                        // Headers
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        // Text formatting
                        'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'mark', 'del', 'ins', 'sub', 'sup',
                        // Links and media
                        'a', 'img',
                        // Lists
                        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
                        // Code
                        'code', 'pre', 'kbd', 'samp',
                        // Quotes and blocks
                        'blockquote', 'cite', 'q',
                        // Tables
                        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
                        // Structural
                        'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main',
                        // Misc
                        'hr', 'details', 'summary'
                    ],
                    ALLOWED_ATTR: [
                        'href', 'target', 'rel', 'id', 'class', 'title', 
                        'alt', 'src', 'width', 'height', 'loading',
                        'colspan', 'rowspan', 'scope', 'headers',
                        'open', 'reversed', 'start', 'type'
                    ],
                    ADD_ATTR: ['target'], // Ensure external links can open in new tabs
                    ALLOW_DATA_ATTR: false,
                    RETURN_DOM: false,
                    RETURN_DOM_FRAGMENT: false
                });
                
                return cleanHtml;
            } else {
                // Fallback to basic conversion
                return this.basicConversion(markdownContent);
            }
        } catch (error) {
            console.error('Error converting markdown to HTML:', error);
            return this.basicConversion(markdownContent);
        }
    }

    /**
     * Fallback basic markdown conversion using regex
     * @param {string} markdownContent - The markdown content to convert
     * @returns {string} Basic HTML string
     */
    basicConversion(markdownContent) {
        try {
            let html = markdownContent
                // Headers
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
                .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
                // Text formatting
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                .replace(/`(.*?)`/gim, '<code>$1</code>')
                .replace(/~~(.*?)~~/gim, '<del>$1</del>')
                // Links
                .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
                // Lists
                .replace(/^\* (.*$)/gim, '<li>$1</li>')
                .replace(/^\- (.*$)/gim, '<li>$1</li>')
                .replace(/^\+ (.*$)/gim, '<li>$1</li>')
                .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
                // Line breaks and paragraphs
                .replace(/\n\n/gim, '</p><p>')
                .replace(/\n/gim, '<br>');
            
            // Wrap in paragraphs
            html = '<p>' + html + '</p>';
            
            // Fix list wrapping
            html = html.replace(/(<li>.*?<\/li>)(?:\s*<br>\s*<li>.*?<\/li>)*/gim, '<ul>$&</ul>');
            html = html.replace(/<br>\s*(<li>)/gim, '$1');
            html = html.replace(/(<\/li>)\s*<br>/gim, '$1');
            
            // Clean up empty elements
            html = html.replace(/<p><\/p>/gim, '');
            html = html.replace(/<p><br><\/p>/gim, '');
            
            return html;
        } catch (error) {
            console.error('Error in basic markdown conversion:', error);
            return '<p style="color: #f87171;">Error rendering markdown content</p>';
        }
    }

    /**
     * Check if markdown utilities are ready
     * @returns {boolean} True if ready to convert markdown
     */
    isInitialized() {
        return this.isReady;
    }

    /**
     * Get status information about the markdown utilities
     * @returns {object} Status object with library information
     */
    getStatus() {
        return {
            isReady: this.isReady,
            librariesLoaded: this.librariesLoaded,
            markedAvailable: typeof marked !== 'undefined',
            dompurifyAvailable: typeof DOMPurify !== 'undefined'
        };
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownUtils;
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
    window.MarkdownUtils = new MarkdownUtils();
}
