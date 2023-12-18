const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { getCourseDetails, getCoursePageDetails } = require('./utils');
const fsParser = require('./fs_parser');
const dotenv = require('dotenv')
dotenv.config()
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

function runParserIfJsonNotExists(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    fsParser.main();
  }
}

// Check if course_structure.json exists in the src directory
const jsonPath = path.join(__dirname, 'course_structure.json');

runParserIfJsonNotExists(jsonPath);

// Read the JSON file and get the top-level folder name
const jsonContent = fs.readFileSync(jsonPath, 'utf8');
const jsonObject = JSON.parse(jsonContent);
const topLevelFolderName = jsonObject.name;

// Call main function with the top-level folder name
main(topLevelFolderName);
