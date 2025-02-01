const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to 'false' to avoid bot detection
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // Set a random user-agent to avoid bot detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  // Go to the Udemy search results page
  const url = 'https://www.udemy.com/courses/search/?q=free';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for the course list to load
  await page.waitForSelector('div.course-list--container--FuG0T', { timeout: 60000 });

  // Scrape course data
  const courses = await page.evaluate(() => {
    const courseNodes = document.querySelectorAll('div.popper--popper--2r2To'); // This might change, so inspect the page and update it if needed
    const courseList = [];
    
    courseNodes.forEach((courseNode) => {
      const courseTitle = courseNode.querySelector('a.udlite-custom-focus-visible span.udlite-focus-visible-target').innerText;
      const courseLink = courseNode.querySelector('a.udlite-custom-focus-visible').href;
      const courseRating = courseNode.querySelector('span.udlite-heading-sm.star-rating--rating-number--3lVe8').innerText;
      const coursePrice = courseNode.querySelector('span.price-text--price-part--Tu6MH span').innerText;

      courseList.push({
        title: courseTitle,
        link: courseLink,
        rating: courseRating,
        price: coursePrice,
      });
    });

    return courseList;
  });

  // Log the scraped data
  console.log(courses);

  // Pagination: Navigate to the next page (if necessary)
  const nextButton = await page.$('a.udlite-btn.udlite-btn-medium.udlite-btn-link.udlite-btn-ghost.udlite-btn-block.pagination--next--1FZWN');
  if (nextButton) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      nextButton.click(),
    ]);
    // You can repeat the scraping logic for the next page
  }

  // Close browser
  await browser.close();
})();
