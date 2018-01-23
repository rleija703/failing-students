const fetch = require('isomorphic-fetch')

/**
 * Find average test grade of course
 * 
 * @param {Array} tests List of test grades
 */
const findCourseAverage = (tests, rounded = true) => {
  const gradeSum = tests.reduce((total, test) => test.grade + total, 0)
  const averageGrade = gradeSum / tests.length

  if (rounded) return Math.round(averageGrade)

  return {floatAvg: averageGrade, intAvg: Math.round(averageGrade)}
}


/**
 * Answer
 * 
 * Get students failing below a specific grade average on a specific course.
 *
 * @param {Array}      students List of students.
 * @param {String}       course Course category.
 * @param {String}         sort Sort type.
 * @param {Number} gradeAverage Grade average.
 */
const answer = (students = [], courseCategory = 'math', sort = 'name', gradeAverage = 70) => {
  let results = []

  // Filter students by course
  const studentList = students.filter(student => student.classes.filter(c => c.name.toLowerCase() === courseCategory).length)

  if (studentList.length) {
    const failingStudents = studentList
      .filter(students => {
        const course = students.classes.find(course => course.name.toLowerCase() === courseCategory)
        const courseGradeAverage = findCourseAverage(course.tests)
        return courseGradeAverage < gradeAverage
      })

    results = failingStudents.map(student => {
      const course = student.classes.find(course => course.name.toLowerCase() === courseCategory)
      const courseGradeAverage = findCourseAverage(course.tests, false)
      return Object.assign({}, student, {
        courseResults: {
          courseCategory,
          floatAvg: courseGradeAverage.floatAvg,
          intAvg: courseGradeAverage.intAvg
        }})
    });

    if (sort === 'name') {
      results = results.slice(0).sort((a, b) => {
        const aName = a.name.trim()
        const bName = b.name.trim()

        if(aName < bName) return -1;
        if(aName > bName) return 1;
        return 0;
      })
    } else {
      results = results.slice(0).sort((a, b) => a.courseResults.floatAvg - b.courseResults.floatAvg)

      if (sort === 'desc') results.reverse()
    }

  }

  return results
}

/**
 * Fetch students from gist api endpoint and return promise with all students
 */
const fetchStudents = () => {
  return fetch("https://gist.githubusercontent.com/petersondrew/4aa8ae630a283a7b942fb693047fc4d7/raw/7c9d643400449e9cbd51faa3afe63c7c28b1dfa7/students.json")
    .then(res => res.json())
}

fetchStudents()
  .catch(err => console.error(`Error fetching students, check your internet connection. ${err}`))
  .then(students => {
    answer(students, 'reading', 'desc', 90).forEach(student => {
      console.log(`${student.name} - ${student.courseResults.intAvg}`);
    });
  });