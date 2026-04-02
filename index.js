const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        message: 'Scraper is running',
        usage: '/scrape?url=https://example.com'
    });
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
