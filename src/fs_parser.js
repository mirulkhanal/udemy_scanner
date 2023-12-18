const fs = require('fs');
const path = require('path');
const directoryTree = require('directory-tree');

// const coursesFolder = '/run/media/mirul/3a7a879a-72f1-46b6-a75b-ff4d7a0d03ff/Torrents/Courses/';

// Function to get the courses folder path from .config file or user input
function getCoursesFolderPath() {
  const configPath = path.join(__dirname, '.config');
  
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const match = configContent.match(/COURSES_FOLDER=(.+)/);
    
    if (match && match[1]) {
      return match[1];
    }
  }

  const prompt = require('prompt-sync')();
  const userPath = prompt('Enter the path to the courses folder: ');
  
  // Write the entered path to the .config file
  fs.writeFileSync(configPath, `COURSES_FOLDER=${userPath}`);
  
  return userPath;
}

const coursesFolder = getCoursesFolderPath();

function getCoursesList(rootPath) {
  const coursesList = [];

  fs.readdirSync(rootPath).forEach(courseFolder => {
    const coursePath = path.join(rootPath, courseFolder);
    if (fs.statSync(coursePath).isDirectory()) {
      const cleanedTitle = cleanCourseTitle(courseFolder);
      const courseDetails = {
        title: cleanedTitle,
        path: coursePath,
        size: getFolderSize(coursePath),
        subfolders: getSubfolders(coursePath),
      };
      coursesList.push(courseDetails);
    }
  });

  return coursesList;
}

// Function to clean the course title by extracting text after hyphen and leading space
function cleanCourseTitle(folderName) {
  const match = folderName.match(/- (.*)/);
  const cleanedTitle = match ? match[1] : folderName;
  return cleanedTitle;
}




// Function to get the size of a folder
function getFolderSize(folderPath) {
  const stats = fs.statSync(folderPath);
  return stats.size;
}

// Function to get subfolders of a folder
function getSubfolders(folderPath) {
  const subfolders = fs.readdirSync(folderPath)
    .filter(item => fs.statSync(path.join(folderPath, item)).isDirectory());
  return subfolders;
}

// Function to traverse a course folder and generate a JSON array
function traverseCourseFolder(coursePath) {
  const tree = directoryTree(coursePath);
  return generateJsonArray(tree);
}

// Helper function to generate JSON array from directory tree
function generateJsonArray(node) {
  const jsonArray = { name: node.name, children: [] };

  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      jsonArray.children.push(generateJsonArray(child));
    });
  }

  return jsonArray;
}

// Function to display the list of courses and prompt user for selection
function selectCourse(coursesList) {
  console.log('Top Level Folders:');
  coursesList.forEach((course, index) => {
    console.log(`${index + 1}. ${course.title}`);
  });

  const selectedCourseIndex = promptForCourseSelection(coursesList.length);
  const selectedCourse = coursesList[selectedCourseIndex - 1];
  return selectedCourse;
}

// Function to prompt user for course selection
function promptForCourseSelection(maxIndex) {
  const prompt = require('prompt-sync')();
  let selection = 0;
  while (selection < 1 || selection > maxIndex) {
    selection = parseInt(prompt('Select a course (enter the number): '), 10);
    if (selection < 1 || selection > maxIndex) {
      console.log('Invalid selection. Please try again.');
    }
  }
  return selection;
}

// Main function to perform the operations
function main() {
  const coursesList = getCoursesList(coursesFolder);

  // Choose a course title to traverse
  const selectedCourse = selectCourse(coursesList);

  if (selectedCourse) {
    const jsonOutput = traverseCourseFolder(selectedCourse.path);
    console.log('JSON Output:', jsonOutput);

    // Export the JSON to a file
    const outputPath = path.join(__dirname, 'course_structure.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
    console.log(`JSON exported to ${outputPath}`);
  } else {
    console.log('No course selected.');
  }
}

// Run the main function
main();
