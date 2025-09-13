# Markdown Viewer Component

A standalone, beautiful markdown viewer component for the Matrx Chrome extension.

## Features

### 🎨 **Beautiful Styling**
- Modern glass-morphism design with backdrop blur effects
- Responsive layout that works on desktop and mobile
- Professional typography with proper spacing
- Syntax highlighting for code blocks
- Table styling with alternating rows
- Gradient backgrounds and smooth animations

### 📝 **Markdown Support**
- Full GitHub Flavored Markdown (GFM) support
- Headers with automatic styling and borders
- Code blocks with syntax highlighting
- Tables with beautiful styling
- Blockquotes with left border styling
- Lists (ordered and unordered)
- Links with hover effects
- Images with rounded corners and shadows
- Horizontal rules with gradient styling

### 🔧 **Interactive Features**
- **Toggle View**: Switch between rendered markdown and raw text
- **Copy Content**: Copy the current view (rendered or raw) to clipboard
- **Code Block Copy**: Individual copy buttons for each code block
- **Responsive Design**: Works on all screen sizes

### 🛡️ **Security**
- Uses DOMPurify to sanitize HTML content
- Safe rendering of user-generated markdown
- XSS protection built-in

## Files Structure

```
components/
├── markdown-viewer.html    # Main HTML structure
├── markdown-viewer.css     # Comprehensive styling
├── markdown-viewer.js      # JavaScript functionality
└── README.md              # This documentation
```

## Dependencies

- **[Marked.js](https://marked.js.org/)** v9.1.6 - Markdown parser
- **[DOMPurify](https://github.com/cure53/DOMPurify)** v3.0.5 - HTML sanitizer

## Usage

### Standalone Development

1. Open `markdown-viewer.html` in a browser
2. Modify the embedded data or URL parameters to test with different content
3. Edit CSS and JS files independently
4. Test functionality in isolation

### Integration with Extension

The component is used by the main extension through the `openMarkdownViewer()` function which creates a self-contained HTML blob with the component embedded.

### Content Loading

The component supports multiple ways to load content:

1. **Embedded Data**: `window.EMBEDDED_MARKDOWN_DATA`
2. **URL Parameters**: `?content=encoded_markdown_content`
3. **Dynamic Updates**: `markdownViewer.updateContent(newContent)`

## Development

### CSS Customization

The CSS is organized into sections:
- Base styles and layout
- Header and controls styling
- Content wrapper and containers
- Markdown-specific styling
- Raw content styling
- Responsive design
- Scrollbar customization

### JavaScript API

```javascript
// Main class
class MarkdownViewer {
    constructor()
    init()
    renderContent()
    toggleView()
    copyContent()
    updateContent(newContent)
    showError(message)
}

// Global instance
window.markdownViewer
```

### Customization Points

1. **Colors**: Modify the CSS color variables
2. **Typography**: Update font families and sizes
3. **Layout**: Adjust container widths and spacing
4. **Features**: Add new functionality to the JavaScript class

## Browser Support

- Chrome 88+ (Extension target)
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance

- Lightweight: ~15KB total size
- Fast rendering with marked.js
- Efficient DOM updates
- Smooth animations and transitions

## Testing

Test with various markdown content:
- Headers (H1-H6)
- Code blocks with different languages
- Tables with multiple columns
- Long content for scrolling
- Special characters and HTML entities
- Images and links

## Contributing

When working on this component:

1. Test standalone functionality first
2. Ensure responsive design works
3. Verify security with DOMPurify
4. Test integration with main extension
5. Update this README if adding features

## License

Part of the Matrx Chrome Extension project. 