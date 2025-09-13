class MarkdownViewer {
    constructor() {
        this.markdownContent = '';
        this.isRenderedView = true;
        this.elements = {
            renderedContent: document.getElementById('renderedContent'),
            rawContent: document.getElementById('rawContent'),
            rawMarkdown: document.getElementById('rawMarkdown'),
            toggleBtn: document.getElementById('toggleView'),
            copyBtn: document.getElementById('copyBtn')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadMarkdownContent();
        this.configureMarked();
    }
    
    setupEventListeners() {
        this.elements.toggleBtn.addEventListener('click', () => this.toggleView());
        this.elements.copyBtn.addEventListener('click', () => this.copyContent());
    }
    
    configureMarked() {
        // Configure marked.js options for better rendering
        marked.setOptions({
            breaks: true, // Convert line breaks to <br>
            gfm: true,    // GitHub Flavored Markdown
            headerIds: true,
            highlight: function(code, lang) {
                // Basic syntax highlighting placeholder
                return `<code class="language-${lang || 'text'}">${code}</code>`;
            }
        });
    }
    
    loadMarkdownContent() {
        try {
            // Try to get content from embedded data first
            if (window.EMBEDDED_MARKDOWN_DATA) {
                this.markdownContent = window.EMBEDDED_MARKDOWN_DATA;
                this.renderContent();
                return;
            }
            
            // Try to get content from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const encodedContent = urlParams.get('content');
            
            if (encodedContent) {
                try {
                    this.markdownContent = decodeURIComponent(encodedContent);
                    this.renderContent();
                    return;
                } catch (e) {
                    console.error('Failed to decode URL content:', e);
                }
            }
            
            // Fallback - show error message
            this.showError('No markdown content provided');
            
        } catch (error) {
            console.error('Error loading markdown content:', error);
            this.showError('Failed to load markdown content');
        }
    }
    
    renderContent() {
        if (!this.markdownContent) {
            this.showError('No content available');
            return;
        }
        
        try {
            // Parse markdown and sanitize HTML
            const htmlContent = marked.parse(this.markdownContent);
            const sanitizedHtml = DOMPurify.sanitize(htmlContent);
            
            // Update rendered content
            this.elements.renderedContent.innerHTML = sanitizedHtml;
            
            // Update raw content
            this.elements.rawMarkdown.textContent = this.markdownContent;
            
            // Add syntax highlighting if available
            this.addSyntaxHighlighting();
            
            console.log('Markdown content rendered successfully');
            
        } catch (error) {
            console.error('Error rendering markdown:', error);
            this.showError('Failed to render markdown content');
        }
    }
    
    addSyntaxHighlighting() {
        // Add basic syntax highlighting to code blocks
        const codeBlocks = this.elements.renderedContent.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            // Add copy button to code blocks
            this.addCodeBlockCopyButton(block.parentElement);
        });
    }
    
    addCodeBlockCopyButton(preElement) {
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.innerHTML = '📋';
        copyButton.title = 'Copy code';
        copyButton.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        preElement.style.position = 'relative';
        preElement.appendChild(copyButton);
        
        // Show/hide copy button on hover
        preElement.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
        });
        
        preElement.addEventListener('mouseleave', () => {
            copyButton.style.opacity = '0';
        });
        
        // Copy functionality
        copyButton.addEventListener('click', async () => {
            const code = preElement.querySelector('code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                copyButton.innerHTML = '✅';
                setTimeout(() => {
                    copyButton.innerHTML = '📋';
                }, 1500);
            } catch (error) {
                console.error('Failed to copy code:', error);
                copyButton.innerHTML = '❌';
                setTimeout(() => {
                    copyButton.innerHTML = '📋';
                }, 1500);
            }
        });
    }
    
    toggleView() {
        this.isRenderedView = !this.isRenderedView;
        
        if (this.isRenderedView) {
            this.elements.renderedContent.style.display = 'block';
            this.elements.rawContent.style.display = 'none';
            this.elements.toggleBtn.textContent = '🔄 Show Raw';
        } else {
            this.elements.renderedContent.style.display = 'none';
            this.elements.rawContent.style.display = 'block';
            this.elements.toggleBtn.textContent = '🔄 Show Rendered';
        }
    }
    
    async copyContent() {
        try {
            const contentToCopy = this.isRenderedView 
                ? this.elements.renderedContent.textContent 
                : this.markdownContent;
                
            await navigator.clipboard.writeText(contentToCopy);
            
            // Show feedback
            const originalText = this.elements.copyBtn.textContent;
            this.elements.copyBtn.textContent = '✅ Copied!';
            this.elements.copyBtn.disabled = true;
            
            setTimeout(() => {
                this.elements.copyBtn.textContent = originalText;
                this.elements.copyBtn.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy content:', error);
            
            // Show error feedback
            const originalText = this.elements.copyBtn.textContent;
            this.elements.copyBtn.textContent = '❌ Failed';
            
            setTimeout(() => {
                this.elements.copyBtn.textContent = originalText;
            }, 2000);
        }
    }
    
    showError(message) {
        this.elements.renderedContent.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 300px;
                color: #ef4444;
                text-align: center;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="margin-bottom: 10px; color: #dc2626;">Error</h2>
                <p style="color: #64748b;">${message}</p>
            </div>
        `;
    }
    
    // Public method to update content dynamically
    updateContent(newContent) {
        this.markdownContent = newContent;
        this.renderContent();
    }
}

// Initialize the markdown viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.markdownViewer = new MarkdownViewer();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownViewer;
} 