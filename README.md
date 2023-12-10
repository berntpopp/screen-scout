
# Screen-Scout

![screen-scout_logo](static/img/screen-scout_logo.png)

Screen-Scout is a tool for capturing screenshots of web pages and their linked pages. It's built on top of Puppeteer and allows users to recursively capture screenshots of a web page and all linked pages within specified depth and page limits.

## Features

- **Webpage Screenshot Capturing**: Take screenshots of individual web pages.
- **Recursive Link Navigation**: Follow links within a page to capture screenshots of linked pages.
- **Customizable Depth and Page Limits**: Control how deep the tool goes into linked pages and the maximum number of pages to capture.
- **Resolution and File Type Options**: Specify the resolution of the screenshots and choose between different file formats (PNG, JPEG, WebP, PDF).
- **Enhanced Link Filtering**: Option to include or exclude external links and avoid capturing duplicate or same-page links.

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed, then clone the repository and run:

```bash
npm install
```

This will install all required dependencies, including Puppeteer.

## Usage

Run the script from the command line, specifying the required options. Here is an example command:

```bash
node screen-scout.js --url "https://example.com" --resolution "1280x720" --output "./output" --type "png" --depth 2 --maxPages 10 --followExternal false
```

### Command Line Options

- `--url, -u`: The URL of the webpage to capture (required).
- `--resolution, -r`: Screen resolution in the format WIDTHxHEIGHT (default: '1920x1080').
- `--output, -o`: Directory to save the screenshot or PDF (default: './screenshots').
- `--type, -t`: Output file type (options: 'png', 'jpeg', 'webp', 'pdf'; default: 'png').
- `--depth, -d`: Recursion depth for following links (default: 1).
- `--maxPages, -m`: Maximum number of pages to capture (default: 10).
- `--followExternal, -f`: Whether to follow external links (default: false).

## Contributing

Contributions to Screen-Scout are welcome! Feel free to open issues or submit pull requests.

## License

Screen-Scout is released under the [MIT License](LICENSE).
