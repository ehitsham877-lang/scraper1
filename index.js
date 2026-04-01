const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Home Page with HTML & CSS
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Web Scraper</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                padding: 40px;
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 10px;
            }
            .subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                color: #333;
                font-weight: 600;
                margin-bottom: 8px;
            }
            input {
                width: 100%;
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
                transition: border-color 0.3s;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
            }
            button {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            button:hover {
                transform: translateY(-2px);
            }
            button:active {
                transform: translateY(0);
            }
            #loading {
                display: none;
                text-align: center;
                color: #667eea;
                margin-top: 20px;
            }
            #results {
                display: none;
                margin-top: 30px;
            }
            .result-section {
                margin-bottom: 25px;
            }
            .result-section h3 {
                color: #667eea;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .stat-box {
                display: inline-block;
                background: #f0f0f0;
                padding: 10px 20px;
                border-radius: 5px;
                margin-right: 15px;
                margin-bottom: 10px;
            }
            .stat-box strong {
                color: #667eea;
            }
            .list-item {
                background: #f9f9f9;
                padding: 12px;
                margin-bottom: 8px;
                border-left: 4px solid #667eea;
                border-radius: 3px;
            }
            .link-item {
                background: #f9f9f9;
                padding: 12px;
                margin-bottom: 8px;
                border-left: 4px solid #667eea;
                border-radius: 3px;
            }
            .link-item a {
                color: #667eea;
                text-decoration: none;
            }
            .link-item a:hover {
                text-decoration: underline;
            }
            .error {
                background: #fee;
                color: #c33;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #c33;
                display: none;
            }
            .success {
                background: #efe;
                color: #3c3;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #3c3;
                display: none;
            }
            .header-item {
                background: #f9f9f9;
                padding: 12px;
                margin-bottom: 8px;
                border-left: 4px solid #667eea;
                border-radius: 3px;
            }
            .header-level {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 3px 8px;
                border-radius: 3px;
                font-size: 12px;
                margin-right: 8px;
                font-weight: 600;
            }
            .image-item {
                background: #f9f9f9;
                padding: 12px;
                margin-bottom: 8px;
                border-left: 4px solid #667eea;
                border-radius: 3px;
            }
            .image-item img {
                max-width: 100px;
                margin-top: 8px;
                border-radius: 3px;
            }
            .text-preview {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                font-style: italic;
                color: #666;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌐 Web Scraper</h1>
            <p class="subtitle">Extract page titles, headers, paragraphs, links, and images</p>
            
            <div class="form-group">
                <label for="url">Enter URL to Scrape:</label>
                <input type="url" id="url" placeholder="https://en.wikipedia.org/wiki/Game" required>
            </div>
            
            <button onclick="scrapeWebsite()">🔍 Scrape Website</button>
            
            <div id="loading">⏳ Scraping... Please wait...</div>
            <div class="error" id="error"></div>
            <div class="success" id="success">✓ Scraping completed successfully!</div>
            
            <div id="results"></div>
        </div>

        <script>
            async function scrapeWebsite() {
                const url = document.getElementById('url').value;
                
                if (!url) {
                    alert('Please enter a URL');
                    return;
                }
                
                document.getElementById('loading').style.display = 'block';
                document.getElementById('error').style.display = 'none';
                document.getElementById('success').style.display = 'none';
                document.getElementById('results').style.display = 'none';
                
                try {
                    const response = await fetch('/scrape?url=' + encodeURIComponent(url));
                    const data = await response.json();
                    
                    if (data.error) {
                        document.getElementById('error').textContent = '❌ Error: ' + data.error;
                        document.getElementById('error').style.display = 'block';
                    } else {
                        document.getElementById('success').style.display = 'block';
                        displayResults(data);
                    }
                } catch (error) {
                    document.getElementById('error').textContent = '❌ Error: ' + error.message;
                    document.getElementById('error').style.display = 'block';
                } finally {
                    document.getElementById('loading').style.display = 'none';
                }
            }
            
            function displayResults(data) {
                let html = '';
                
                // Title
                if (data.title) {
                    html += '<div class="result-section"><h3>📄 Page Title</h3>';
                    html += '<div class="list-item"><strong>' + escapeHtml(data.title) + '</strong></div></div>';
                }
                
                // Statistics
                html += '<div class="result-section"><h3>📊 Statistics</h3>';
                html += '<div class="stat-box"><strong>Headers:</strong> ' + data.textCount.headersFound + '</div>';
                html += '<div class="stat-box"><strong>Paragraphs:</strong> ' + data.textCount.paragraphsFound + '</div>';
                html += '<div class="stat-box"><strong>Links:</strong> ' + data.textCount.linksFound + '</div>';
                html += '<div class="stat-box"><strong>Images:</strong> ' + data.textCount.imagesFound + '</div>';
                html += '</div>';
                
                // Headers
                if (data.headers.length > 0) {
                    html += '<div class="result-section"><h3>📑 Headers (H1, H2, H3) - showing first 10</h3>';
                    data.headers.slice(0, 10).forEach(h => {
                        html += '<div class="header-item"><span class="header-level">' + h.level + '</span>' + escapeHtml(h.text) + '</div>';
                    });
                    html += '</div>';
                }
                
                // Paragraphs
                if (data.paragraphs.length > 0) {
                    html += '<div class="result-section"><h3>📝 Paragraphs - showing first 5</h3>';
                    data.paragraphs.slice(0, 5).forEach(p => {
                        let text = escapeHtml(p);
                        if (text.length > 200) text = text.substring(0, 200) + '...';
                        html += '<div class="list-item">' + text + '</div>';
                    });
                    html += '</div>';
                }
                
                // Links
                if (data.links.length > 0) {
                    html += '<div class="result-section"><h3>🔗 Links - showing first 10</h3>';
                    data.links.slice(0, 10).forEach(l => {
                        html += '<div class="link-item"><strong>' + escapeHtml(l.text) + '</strong><br><a href="' + escapeHtml(l.url) + '" target="_blank">' + escapeHtml(l.url.substring(0, 80)) + '</a></div>';
                    });
                    html += '</div>';
                }
                
                // Images
                if (data.images.length > 0) {
                    html += '<div class="result-section"><h3>🖼️ Images - showing first 5</h3>';
                    data.images.slice(0, 5).forEach(img => {
                        html += '<div class="image-item"><strong>' + escapeHtml(img.alt) + '</strong><br><img src="' + escapeHtml(img.src) + '" onerror="this.style.display=\\'none\\'"></div>';
                    });
                    html += '</div>';
                }
                
                // Text Preview
                if (data.allTextPreview) {
                    html += '<div class="result-section"><h3>📖 Text Preview</h3>';
                    html += '<div class="text-preview">' + escapeHtml(data.allTextPreview) + '</div>';
                    html += '</div>';
                }
                
                document.getElementById('results').innerHTML = html;
                document.getElementById('results').style.display = 'block';
            }
            
            function escapeHtml(text) {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, m => map[m]);
            }
            
            // Allow Enter key to scrape
            document.getElementById('url').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') scrapeWebsite();
            });
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// The Scraper Endpoint
app.get('/scrape', async (req, res) => {
    const targetUrl = req.query.url; // You pass the URL as a parameter

    if (!targetUrl) {
        return res.status(400).json({ error: "Please provide a URL" });
    }

    try {
        // 1. Get the HTML from the website
        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // 2. Load the HTML into Cheerio
        const $ = cheerio.load(data);
        
        // 3. Scrape all elements
        
        // Get page title
        const pageTitle = $('title').text();
        
        // Get all headers (H1, H2, H3)
        const headers = [];
        $('h1, h2, h3').each((i, el) => {
            headers.push({
                level: el.name.toUpperCase(),
                text: $(el).text().trim()
            });
        });
        
        // Get all paragraphs
        const paragraphs = [];
        $('p').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 0) {
                paragraphs.push(text);
            }
        });
        
        // Get all links
        const links = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && text.length > 0) {
                links.push({
                    text: text,
                    url: href
                });
            }
        });
        
        // Get all images
        const images = [];
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || 'No description';
            if (src) {
                images.push({
                    src: src,
                    alt: alt
                });
            }
        });
        
        // Get all text content
        const allText = $('body').text().replace(/\s+/g, ' ').trim();

        // 4. Return the data as JSON
        res.json({
            title: pageTitle,
            headers: headers,
            paragraphs: paragraphs,
            links: links,
            images: images,
            textCount: {
                headersFound: headers.length,
                paragraphsFound: paragraphs.length,
                linksFound: links.length,
                imagesFound: images.length
            },
            allTextPreview: allText.substring(0, 500) + '...'
        });

    } catch (error) {
        res.status(500).json({ error: "Could not scrape the site. It might be blocking us." });
    }
});

app.listen(PORT, () => {
    console.log(`Scraper running on port ${PORT}`);
});