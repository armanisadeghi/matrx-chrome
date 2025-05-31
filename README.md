# Matrx Chrome Extension

A Chrome extension for the Matrx platform that extracts web content and stores it in a Supabase database with real-time backend integration.

## Features

- 🚀 **One-click content extraction** from any web page
- 🗄️ **Supabase integration** for cloud storage
- 🎨 **Clean, modern UI** with intuitive controls
- 🔧 **Easy configuration** through settings page
- 📱 **Context menu** for quick access
- 🔒 **Secure storage** of credentials in Chrome sync
- 👤 **User tracking** with configurable user ID
- ⚡ **Real-time communication** with Python backend via Socket.IO

## Installation

### For Development/Personal Use

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd matrx-chrome
   ```

2. **Set up Supabase Database**
   - Go to [Supabase](https://supabase.com) and create a new project
   - In the SQL Editor, run this command to create the required table:
   
   ```sql
   CREATE TABLE html_extractions (
     id BIGSERIAL PRIMARY KEY,
     url TEXT NOT NULL,
     title TEXT,
     html_content TEXT NOT NULL,
     meta_description TEXT,
     meta_keywords TEXT,
     content_length INTEGER,
     extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     user_agent TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     user_id UUID,
     CONSTRAINT html_extractions_user_id_fkey 
       FOREIGN KEY (user_id) REFERENCES auth.users (id) 
       ON UPDATE CASCADE ON DELETE CASCADE
   );
   ```

3. **Get your Supabase credentials**
   - Go to Settings → API in your Supabase dashboard
   - Copy your Project URL and anon/public key

4. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select this folder
   - The extension will be installed and the settings page will open

5. **Configure the extension**
   - Enter your Supabase Project URL
   - Enter your Supabase anon key
   - Set the table name (default: `html_extractions`)
   - **Set your User ID** (any unique identifier like email, username, or UUID)
   - Optionally configure Socket.IO server URL for real-time backend communication
   - Click "Test Connection" to verify
   - Click "Save Configuration"

## Usage

### Method 1: Extension Popup
1. Navigate to any web page
2. Click the Matrx extension icon in the toolbar
3. Click "Extract Current Page"
4. View the extraction status and results

### Method 2: Context Menu
1. Right-click anywhere on a web page
2. Select "Extract with Matrx"

## File Structure

```
matrx-chrome/
├── manifest.json          # Extension configuration
├── popup/
│   ├── popup.html         # Extension popup interface
│   ├── popup.css          # Popup styling
│   └── popup.js           # Popup functionality
├── content/
│   └── content.js         # Content script for HTML extraction
├── background/
│   └── background.js      # Background service worker
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings page styling
│   └── options.js         # Settings functionality
├── socket/
│   └── socket-client.js   # Socket.IO client for real-time communication
├── icons/
│   ├── icon16.png         # 16x16 extension icon
│   ├── icon32.png         # 32x32 extension icon
│   ├── icon48.png         # 48x48 extension icon
│   └── icon128.png        # 128x128 extension icon
└── README.md              # This file
```

## Database Schema

The extension creates records with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `url` | TEXT | Page URL |
| `title` | TEXT | Page title |
| `html_content` | TEXT | Full HTML content |
| `meta_description` | TEXT | Meta description tag |
| `meta_keywords` | TEXT | Meta keywords tag |
| `content_length` | INTEGER | HTML content length |
| `extracted_at` | TIMESTAMP | Extraction timestamp |
| `user_agent` | TEXT | Browser user agent |
| `created_at` | TIMESTAMP | Record creation time |
| `user_id` | UUID | User identifier for tracking |

## Real-time Backend Integration

The extension supports real-time communication with your Python backend via Socket.IO:

### Events sent to backend:
- `html_extraction` - Main extraction event with full HTML content
- `extraction_saved` - Confirmation of Supabase save
- `extraction_error` - Error notifications

### Events received from backend:
- `html_extraction_processed` - Processing confirmation
- `extraction_analysis_complete` - Analysis results
- `server_message` - General messages

## Security Notes

- Your Supabase credentials are stored securely in Chrome's sync storage
- The extension only requires access to the current tab (`activeTab` permission)
- All communication with Supabase uses HTTPS
- User ID helps track extractions without full authentication
- Socket.IO communication is optional and non-blocking
- Consider enabling Row Level Security (RLS) in Supabase for additional protection

## Publishing to Chrome Web Store

To prepare for Chrome Web Store submission:

1. **Icons are ready** ✅ (16x16, 32x32, 48x48, 128x128 PNG files)
   
2. **Update manifest.json**
   - Update version as needed
   - Ensure all permissions are necessary
   
3. **Test thoroughly**
   - Test on various websites
   - Verify error handling
   - Check responsive design

4. **Create store assets**
   - Screenshots for store listing
   - Promotional images
   - Detailed description

5. **Submit to Chrome Web Store**
   - Package as ZIP file
   - Submit through Chrome Web Store Developer Dashboard

## Development

### Debugging
- Open Chrome DevTools on any page to see content script console logs
- Right-click extension icon → "Inspect popup" for popup debugging
- Go to `chrome://extensions/` and click "service worker" for background script logs

### Making Changes
1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Matrx extension
4. Test your changes

## Troubleshooting

### "Connection failed" in settings
- Verify your Supabase URL is correct (should end with `.supabase.co`)
- Check that your anon key is valid
- Ensure the table exists in your database

### "Table not found" error
- Run the SQL command provided in setup instructions
- Verify the table name matches your configuration

### "User ID not configured" error
- Open extension settings and set a unique User ID
- This can be any identifier you choose (email, username, UUID, etc.)

### Socket.IO connection issues
- Socket.IO is completely optional - extension works without it
- Check that your Python backend is running on the configured URL
- Use "Test Socket" button to verify connection

### "Cannot extract content from Chrome internal pages"
- This is expected - the extension cannot access Chrome's internal pages
- Try testing on a regular website like `https://example.com`

## About Matrx

Matrx is a comprehensive platform for web content analysis and data processing. This Chrome extension is part of the larger Matrx ecosystem, providing seamless web content extraction capabilities.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions:
- Check the troubleshooting section above
- Open an issue in the repository
- Review Chrome extension development documentation 