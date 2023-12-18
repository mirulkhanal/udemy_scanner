const fs = require('fs');
const path = require('path');
const { fs_parser } = require('./fs_parser');
const { getCourseDetails, getCoursePageDetails } = require('./utils');
const dotenv = require('dotenv');
dotenv.config();

function courseTitlesArray(jsonArray) {
  const titlesArray = jsonArray.map(entry => entry.title);
  return titlesArray;
}

async function getCourseDetailsArray(titles) {
  const apikey = process.env.ZENROWS_API_KEY;
  const detailsArray = [];

  for (const title of titles) {
    const courseDetails = await getCourseDetails(title, apikey);
    const finalDetails = await getCoursePageDetails(courseDetails);
    detailsArray.push(finalDetails);
  }

  return detailsArray;
}

async function main() {
  // Run the fs_parser to generate the initial JSON file
  fs_parser();

  // Read the generated JSON file
  const jsonPath = path.join(__dirname, 'all_course_structure.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const jsonObject = JSON.parse(jsonContent);

  // Extract titles from the generated JSON
  const allTitles = courseTitlesArray(jsonObject);

  // Fetch course details for each title
  const courseDetailsArray = await getCourseDetailsArray(allTitles);
  console.log('Course Details Array:', courseDetailsArray);

  // Create metadata array
  const metadataArray = jsonObject.map((entry, index) => ({
    title: entry.title,
    details: courseDetailsArray[index],
    subfolders: entry.details.children, // Include subfolder details
  }));

  // Export metadata to a new file
  const metadataPath = path.join(__dirname, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadataArray, null, 2));
  console.log(`Metadata exported to ${metadataPath}`);
}

// Run the main function
main();
