// to be completely honest i forgot async/await existed when i wrote most of the code in this file
const path = require('path')
const fs = require('fs');
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded({ extended: false })
// https://stackoverflow.com/questions/3133243/how-do-i-get-the-path-to-the-current-script-with-node-js
const dataFileName = path.resolve(__dirname, '../data/data.json');

function writeResults(resultsObject, completion) {
    let json = JSON.stringify(resultsObject)

    // https://stackabuse.com/reading-and-writing-json-files-with-node-js/
    fs.writeFile(dataFileName, json, (err) => {
        if (err) throw err;
        console.log('Save successed');

        if (completion != null) {
            completion();
        }
    });
}

function getResults(completion, failed = false) {
    fs.access(dataFileName, fs.F_OK, (err) => {
        if (err) {
            if (err.errno == -2 && !failed) {
                writeResults({}, () => {
                    getResults(() => {
                        readResultsFile(completion);
                    }, true);
                });
                return;
            }
            else {
                throw err;
            }
        }

        readResultsFile(completion);
        return;
    });
}

function readResultsFile(completion) {
    fs.readFile(dataFileName, (err, data) => {
        if (err) throw err;

        if (completion != null) {
            completion(JSON.parse(data));
        }
    });
}


module.exports = function (app) {

    // survey input page
    app.get('/', function (request, response) {
        response.render('SurveyView')
    });

    app.post('/', urlEncodedParser, function (request, response) {
        getResults((surveyResults) => {
            var questions = Object.keys(request.body);
            var answers = Object.values(request.body);

            for (var index in questions) {
                var submittedAnswer = answers[index];
                var submittedQuestion = questions[index]

                var existingQuestion = surveyResults[submittedQuestion];
                let questionExisted = true;
                if (typeof existingQuestion === "undefined") {
                    existingQuestion = {};
                    questionExisted = false;
                }

                var found = false;
                for (var value in existingQuestion) {
                    if (value === submittedAnswer) {
                        existingQuestion[value]++;
                        found = true;
                    }
                }

                if (submittedAnswer.length > 0) {
                    if (!found) {
                        existingQuestion[submittedAnswer] = 1;

                        if (!questionExisted) {
                            surveyResults[questions[index]] = existingQuestion
                        }
                    }
                }
            }

            writeResults(surveyResults);

            response.json(surveyResults);
        });
    });

    // results display page
    app.get('/results', function (request, response) {
        // https://coderrocketfuel.com/article/check-if-a-file-exists-using-node-js

        getResults((surveyResults) => {
            response.render('ResultsView', {results: surveyResults});
        });
    });
};