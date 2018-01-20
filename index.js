const fetch = require('isomorphic-fetch')

// TODO: From the answer function, return an array of objects
// with the name and average Math grade of each student that
// is getting less than an average of 70 in Math.
// Round the average grade to the nearest whole number.
// NOTE: Visit https://gist.github.com/petersondrew/4aa8ae630a283a7b942fb693047fc4d7 to see input data

// Get student's average math grade
const getStudentMathAverageGrade = (student = null) => {
  // Get math course & math average grade
  const mathCourse = student.classes.find(course => course.name.toLowerCase() === 'math');
  const mathAverageGrade = mathCourse.tests.reduce((total, test) => test.grade + total, 0) / mathCourse.tests.length;
  return  Math.round(mathAverageGrade);
}

const answer = (students) => {
  let failingStudents = [];

  // Grab students who are taking a math course.
  const mathStudents = students.filter(student => student.classes.filter(c => c.name.toLowerCase() === 'math').length);

  // Return empty array if students don't have a math course
  if (!mathStudents.length) return failingStudents;

  // Get failing students below grade average of 70
  failingStudents = mathStudents.filter(student => getStudentMathAverageGrade(student) < 70)
    .map(student => Object.assign({}, student, {averageGrade: getStudentMathAverageGrade(student)}));
  
  return failingStudents;
};

const fetchStudents = () => {
  return fetch("https://gist.githubusercontent.com/petersondrew/4aa8ae630a283a7b942fb693047fc4d7/raw/7c9d643400449e9cbd51faa3afe63c7c28b1dfa7/students.json")
    .then(res => res.json());
};

// Example output:
// Nickolas Leinen - 65
// Coralee Heilman - 68
fetchStudents()
  .catch(err => console.error(`Error fetching students, check your internet connection. ${err}`))
  .then(students => {
    answer(students).forEach(student => {
      console.log(`${student.name} - ${student.averageGrade}`);
    });
  });
