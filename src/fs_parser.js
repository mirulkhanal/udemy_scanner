const fs = require('fs');
const path = require('path');
const directoryTree = require('directory-tree');


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

// this returns the course folder URL like so: /Users/mkhanal/Desktop/Courses
const coursesFolder = getCoursesFolderPath();

// This function takes in the folder path then traverses it to retrieve the folder structure
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
// so it takes in the `[FreeCourseSite.com] Udemy - Beginning C++ Programming - From Beginner to Beyond`
// and returns `Beginning C++ Programming - From Beginner to Beyond`
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
  return tree;
}


// Function to display the list of courses and prompt user for selection
function selectCourse(coursesList) {
  console.log('Top Level Folders:');
  console.log('0. Select All Folders');

  coursesList.forEach((course, index) => {
    console.log(`${index + 1}. ${course.title}`);
  });

  const selectedCourseIndex = promptForCourseSelection(coursesList.length);

  if (selectedCourseIndex === 0) {
    return coursesList; // Return all folders
  }

  const selectedCourse = coursesList[selectedCourseIndex - 1];
  return [selectedCourse]; // Return the selected folder
}



// Function to prompt user for course selection
function promptForCourseSelection(maxIndex) {
  const prompt = require('prompt-sync')();
  let selection = prompt('Select a course (enter the number, press Enter for all): ');

  if (!selection || isNaN(selection) || selection < 1 || selection > maxIndex) {
    console.log('Invalid selection. Selecting all courses.');
    return 0; // Return 0 to indicate selecting all courses
  }

  return parseInt(selection, 10);
}

// Main function to perform the operations
function fs_parser() {
  const coursesList = getCoursesList(coursesFolder);

  // Choose course title(s) to traverse
  const selectedCourses = selectCourse(coursesList);

  if (selectedCourses.length > 0) {
    const allCourseDetails = selectedCourses.map(course => ({
      title: course.title,
      details: traverseCourseFolder(course.path),
    }));

    // Export the JSON to a file
    const outputPath = path.join(__dirname, 'all_course_structure.json');
    fs.writeFileSync(outputPath, JSON.stringify(allCourseDetails, null, 2));
    console.log(`JSON exported to ${outputPath}`);
  } else {
    console.log('No course selected.');
  }
}

module.exports = { fs_parser, traverseCourseFolder };