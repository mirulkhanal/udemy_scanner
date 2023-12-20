const axios = require('axios');
const cheerio = require('cheerio');

async function getCourseDetails(searchQuery, apikey) {
  try {
    const response = await axios({
      url: 'https://api.zenrows.com/v1/',
      method: 'GET',
      params: {
        url: `https://www.udemy.com/courses/search/?src=ukw&q=${encodeURIComponent(
          searchQuery
        )}`,
        apikey: apikey,
        js_render: 'true',
        js_instructions: '[{"click":".button-selector"}]',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const courseDetails = extractCourseDetails($);
    return courseDetails;
  } catch (error) {
    throw error;
  }
}

async function getCoursePageDetails(courseDetails) {
  try {
    const response = await axios({
      url: 'https://api.zenrows.com/v1/',
      method: 'GET',
      params: {
        url: `https://www.udemy.com${courseDetails.url}`,
        apikey: process.env.ZENROWS_API_KEY,
        js_render: 'true',
      },
    });

    const courseHtml = response.data;
    const course$ = cheerio.load(courseHtml);

    const finalDetails = extractCoursePageDetails(course$);
    return finalDetails;
  } catch (error) {
    throw error;
  }
}

function extractCourseDetails($) {
  const title = $('h3[data-purpose="course-title-url"] a')
    .contents()
    .first()
    .text()
    .trim();
  const url = $('h3[data-purpose="course-title-url"] a').attr('href');

  return { title, url };
}

function extractCoursePageDetails(course$) {
  const courseTitle = course$('.clp-lead__title').text().trim();
  const courseHeadline = course$('.clp-lead__headline').text().trim();
  const badges = course$('.ud-badge')
    .map((i, badge) => course$(badge).text().trim())
    .get();
  const rating = course$('.star-rating-module--rating-number--2xeHu')
    .text()
    .trim();
  const numRatings = extractNumRatings(
    course$('.clp-lead__element-item:contains("ratings") span').text().trim()
  );
  const enrollment = extractEnrollment(
    course$('.clp-lead__element-item:contains("students")').text().trim()
  );
  const instructor = course$('.ud-instructor-links').text().trim();
  const lastUpdate = course$('.last-update-date span').text().trim();
  const courseLanguage = course$('.clp-lead__locale span').text().trim();
  const captionsLanguages = course$('.caption--captions--joQAG span')
    .text()
    .trim();

  // Extract the image URL
  const imageUrl = course$('span.intro-asset--img-aspect--3fbKk img').attr(
    'srcset'
  );
  // console.log('Image URL from srcset', imageUrl);
  const imageArray = extractImageArray(imageUrl);

  return {
    courseTitle,
    courseHeadline,
    badges,
    rating,
    numRatings,
    enrollment,
    instructor,
    lastUpdate,
    courseLanguage,
    captionsLanguages,
    image: imageArray,
  };
}

// Function to extract the image URL with 750w
function extractImageArray(srcset) {
  const imgArray = srcset.split(',').map((url) => url.trim().split(' ')[0]);

  return imgArray;
}

// Function to extract the formatted numRatings
function extractNumRatings(numRatingsText) {
  const matches = numRatingsText.match(/([\d.]+).*\((\d+) ratings\)/);
  return matches ? `${matches[1]} (${matches[2]} ratings)` : null;
}

// Function to extract the formatted enrollment
function extractEnrollment(enrollmentText) {
  const matches = enrollmentText.match(/([\d,]+) students/);
  return matches ? `${matches[1]} students` : null;
}

module.exports = { getCourseDetails, getCoursePageDetails };
