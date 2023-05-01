const  jServiceApiUrl= "https://jservice.io/api/";
const catergoryTopics = 6
const cluesPerCategory = 5
// const axios = require('axios')

let categories = [];
let questionsMap = new Map();

//all catergories will go into one array of objects with each category being 1 object but this array will be built dynamically so for now it should be empty and able to manipulated easily

const jeopardyBoard = $(".jeopardy-board"); // grabbing the html div element for easier access

//need to add click event to the question-boxes
$(".restart-game").click(async () => {
    categories = await getCategories();
    questionsMap = await getQuestions(categories);
    createBoard();
    console.log(questionsMap)  
});

async function getCategories() {
    let offset = Math.floor(Math.random() * 1000);
    
    let resp = await axios.get(jServiceApiUrl + `categories?count=100&offset=${offset}`) 
    let categories = resp.data
        .filter(function (value) {
        return value.clues_count >= 5;
        })
        .sort(() => Math.random())
        .splice(0, catergoryTopics);  
    return categories;
}

async function getQuestions(categories) {
    const questionsMap = new Map()

    for(let category of categories) {
        let resp = await axios.get(jServiceApiUrl + `clues?category=${category.id}`)
        let questions = resp.data
          .sort(() => Math.random())
          .splice(0, cluesPerCategory)
          .map(function(value) {
            return {
                id : value.id,
                question : value.question,
                answer : value.answer,
                status : 'hidden'
            }
          })
        
        questionsMap.set(category.id, questions);  
    }
    return questionsMap;
}

function createBoard () {
    jeopardyBoard.empty()
    for(let category of categories) {
        const columnDiv = $("<div>");
        const headerBox = $("<div>");

        headerBox.text(`${category.title}`);
        headerBox.addClass('box')
        columnDiv.append(headerBox);
        columnDiv.addClass('column')

        for(let question of questionsMap.get(category.id)) {
            const questionBox = $("<div>");

            questionBox.text(`?`)
            questionBox.addClass('question-box', 'box')
            questionBox.click((args) => { //you can pick out the target click on args and modify the body/text
                onBoxClick(args, category.id, question.id)
            })
            columnDiv.append(questionBox)
        }

        jeopardyBoard.append(columnDiv)
    }
}


//Generic onClick function to be used by each question box.
function onBoxClick(args, categoryId, questionId){
    console.log(categoryId + "_" + questionId);

    let questions = questionsMap.get(categoryId);
    let questionIndex = questions.findIndex(function(q) {
        return q.id === questionId //find the first id that matches the id of the one passed in and return
    })
    switch(questions[questionIndex].status) {
        case 'hidden':
            questions[questionIndex].status = "showing";
            args.target.innerHTML = questions[questionIndex].question;
            break;
        case 'showing' :
            questions[questionIndex].status = 'answer';
            args.target.innerHTML = questions[questionIndex].answer;
            break;
        default :
            break; 
    }
    questionsMap.set(categoryId, questions) // pulled categories questions out of the Map, changed one status and put the questions back in to override the entry
    console.log(questions[questionIndex].status);
}
