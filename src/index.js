const axios = require('axios');
const cheerio = require('cheerio');
const { getCourseDetails, getCoursePageDetails } = require('./utils');
const dotenv = require('dotenv').config()
async function main(searchQuery) {
  try {
    const apikey = process.env.ZENROWS_API_KEY;

    const courseDetails = await getCourseDetails(searchQuery, apikey);
    const courseDetailsFinal = await getCoursePageDetails(courseDetails);

    console.log('Final Course Details:', courseDetailsFinal);
  } catch (error) {
    console.error(error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

main('Master Laravel 10 for Beginners & Intermediate 2023');
