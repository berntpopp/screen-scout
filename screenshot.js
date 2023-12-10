// --------------------------------------------------------------- //
const puppeteer = require('puppeteer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const url = require('url');
// --------------------------------------------------------------- //


// --------------------------------------------------------------- //
// Configure command line arguments
const argv = yargs(hideBin(process.argv))
  .option('url', {
    alias: 'u',
    describe: 'URL of the webpage to capture',
    type: 'string',
    demandOption: true
  })
  .option('resolution', {
    alias: 'r',
    describe: 'Screen resolution in the format WIDTHxHEIGHT (e.g., 1920x1080)',
    type: 'string',
    default: '1920x1080'
  })
  .option('output', {
    alias: 'o',
    describe: 'Directory to save the screenshot or PDF',
    type: 'string',
    default: './screenshots'
  })
  .option('type', {
    alias: 't',
    describe: 'Output file type (png, jpeg, webp, pdf)',
    type: 'string',
    default: 'png',
    choices: ['png', 'jpeg', 'webp', 'pdf']
  })
  .option('depth', {
    alias: 'd',
    describe: 'Recursion depth for following links',
    type: 'number',
    default: 1
  })
  .option('maxPages', {
    alias: 'm',
    describe: 'Maximum number of pages to capture',
    type: 'number',
    default: 10
  })
  .option('followExternal', {
    alias: 'f',
    describe: 'Whether to follow external links',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .argv;
// --------------------------------------------------------------- //


// --------------------------------------------------------------- //
/**
 * Generates a filename from a given URL and file type.
 * 
 * @param {string} targetUrl - The URL from which to generate the filename.
 * @param {string} fileType - The type of file (extension) to be used.
 * @return {string} The generated filename.
 */
function getFilenameFromUrl(targetUrl, fileType) {
  const urlObj = new URL(targetUrl);
  const hostname = urlObj.hostname;
  const pathName = urlObj.pathname.replace(/^\//, '').replace(/\//g, '-');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${hostname}${pathName ? '-' + pathName : ''}_${timestamp}.${fileType}`;
}

/**
 * Finds and returns filtered HTTP/HTTPS links on the given page.
 * 
 * @param {object} page - The Puppeteer page object.
 * @param {string} base - The base URL of the current page.
 * @param {boolean} followExternal - Whether to include external links.
 * @return {Promise<Array<string>>} A promise that resolves to an array of link URLs.
 */
async function findLinks(page, base, followExternal) {
  return await page.evaluate(({ base, followExternal }) => {
    const links = Array.from(document.querySelectorAll('a'));
    let uniqueLinks = new Set();

    links.forEach(link => {
      let href = link.href;
      if (href.startsWith('http')) {
        // Check if the link is external
        const isExternal = !href.startsWith(base);
        if (followExternal || !isExternal) {
          uniqueLinks.add(href);
        }
      }
    });

    return Array.from(uniqueLinks);
  }, { base, followExternal });
}

/**
 * Recursively takes screenshots of the given URL and any discovered links up to the specified depth.
 * 
 * @param {string} targetUrl - The initial URL to capture.
 * @param {string} resolution - The screen resolution for the screenshot.
 * @param {string} outputDir - The directory where screenshots will be saved.
 * @param {string} fileType - The file type for the screenshot.
 * @param {number} depth - The recursion depth.
 * @param {number} maxPages - The maximum number of pages to capture.
 * @param {Set<string>} [visited=new Set()] - A set of already visited URLs.
 * @param {number} [currentDepth=1] - The current depth of recursion.
 * @param {boolean} followExternal - Whether to follow external links.
 */
async function takeScreenshots(targetUrl, resolution, outputDir, fileType, depth, maxPages, followExternal, visited = new Set(), currentDepth = 1) {
  if (visited.size >= maxPages || currentDepth > depth) {
    return;
  }

  try {
    visited.add(targetUrl);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const [width, height] = resolution.split('x').map(dim => parseInt(dim, 10));
    await page.setViewport({ width, height });
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    const filename = getFilenameFromUrl(targetUrl, fileType === 'pdf' ? 'pdf' : fileType);
    const outputPath = path.join(outputDir, filename);

    if (fileType === 'pdf') {
      await page.pdf({ path: outputPath, format: 'A4' });
    } else {
      await page.screenshot({ path: outputPath, type: fileType === 'jpeg' ? 'jpeg' : fileType });
    }

    console.log(`Screenshot saved to ${outputPath}`);

    if (currentDepth < depth) {
      const base = new URL(targetUrl).origin;
      const links = await findLinks(page, base, followExternal);
      for (const link of links) {
        if (!visited.has(link)) {
          await takeScreenshots(link, resolution, outputDir, fileType, depth, maxPages, followExternal, visited, currentDepth + 1);
        }
      }
    }

    await browser.close();
  } catch (error) {
    console.error(`Error processing ${targetUrl}:`, error);
  }
}


// --------------------------------------------------------------- //


// --------------------------------------------------------------- //
// Main script execution
if (argv.url) {
  takeScreenshots(argv.url, argv.resolution, argv.output, argv.type, argv.depth, argv.maxPages, argv.followExternal)
    .then(() => console.log('Completed capturing screenshots.'))
    .catch(err => console.error('Error during screenshot capture:', err));
} else {
  yargs.showHelp();
}
// --------------------------------------------------------------- //