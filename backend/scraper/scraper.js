import { metaParser } from './utils/parser';

/**
 * Navigates to specific url with retry mechanism
 * @param {object} browser - chromium browser instance
 * @param {string} url - url for page to load
 * @param {string} courseSection - selector for successful ajax call
 * @param {number} retries - number of retry attempts in case of failure
 * @returns {object} - page object
 */
async function goToPage(browser, url, courseSection, retries = 3) {
  let page;
  const username = process.env.PROXY_USERNAME;
  const password = process.env.PROXY_PASSWORD;
  let attempt = 0;

  while (attempt < retries) {
    try {
      page = await browser.newPage();
      await page.authenticate({ username, password });
      
      // Wait until the page is fully loaded, or the network is idle
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // If courseSection is provided, ensure it exists before returning the page object
      if (courseSection) {
        await page.waitForSelector(courseSection, { timeout: 30000 });  // Wait for the element to ensure page stability
      }
      
      return page;  // Success, return the page
    } catch (error) {
      console.error(`Attempt ${attempt + 1}: Error navigating to url: ${url} => ${error.message}`);
      
      if (error.message.includes('frame was detached') && attempt < retries - 1) {
        console.log('Frame was detached, retrying...');
      } else {
        // Close page if it was created
        if (page) await page.close();
        throw new Error(`Navigating to url: ${url} failed after ${attempt + 1} attempts => : ${error.message}`);
      }
    }
    
    attempt++;
  }
}

/**
 * Gets list of free course links
 * @param {object} page - browser page object
 * @param {string} courseLinkSelector  - selector for course items
 * @returns {Array} - array of course links
 */
async function getCourseLinks(page, courseLinkSelector) {
  let courseLinks;
  try {
    courseLinks = await page.$$eval(courseLinkSelector, (aTags) => aTags.map((a) => a.href));
  } catch (error) {
    throw new Error(`Getting course links failed => : ${error}`);
  }
  return courseLinks;
}

/**
 * Gets course data based on meta tags
 * @param {object} coursePage - browser page for a course
 * @returns {object} course data
 */
async function getCourseData(coursePage) {
  let courseData;
  try {
    courseData = await metaParser(coursePage);
  } catch (error) {
    throw new Error(`Getting course data failed => : ${error}`);
  }
  await coursePage.close();
  return courseData;
}

/**
 * Navigates to next page with retry mechanism
 * @param {object} page - browser page object
 * @param {string} nextSelector - next selector for page
 * @param {number} retries - number of retry attempts in case of failure
 * @returns {object} - next page
 */
async function goToNext(page, nextSelector, retries = 3) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.click(nextSelector),
      ]);
      
      // Ensure the next button is available after navigation
      await page.waitForSelector(nextSelector, { timeout: 30000 });
      
      return page;  // Success, return the page
    } catch (error) {
      console.error(`Attempt ${attempt + 1}: Error navigating to next page => ${error.message}`);
      
      if (error.message.includes('frame was detached') && attempt < retries - 1) {
        console.log('Frame was detached on next page navigation, retrying...');
      } else {
        throw new Error(`Navigating to next page failed after ${attempt + 1} attempts => : ${error.message}`);
      }
    }
    
    attempt++;
  }
}

const scraper = {
  goToPage,
  getCourseLinks,
  getCourseData,
  goToNext,
};

export default scraper;
