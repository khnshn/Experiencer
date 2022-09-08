let Question = class {
  constructor(type, question, answers, property, gameDescriptor) {
    this.type = type;
    this.question = question;
    this.answers = answers;
    this.property = property;
    this.gameDescriptor = gameDescriptor;
  }
};

function parseJson(questions) {
  var questions_array = [];
  for (let i = 0; i < questions.length; i++) {
    questions_array.push(
      new Question(
        questions[i].type,
        questions[i].question,
        questions[i].answers,
        questions[i].property_tk,
        questions[i].gameDescriptor_tk
      )
    );
  }
  return questions_array;
}

function insertHTML(html, selector) {
  $(selector).append(html);
}

function prepareQuestions(questions, selector) {
  question_ids = [];
  var html_template = `<div class="ui-popup" id="$id">
  <div class="ui-popup-content">
  <div class="question">$question</div>
  <ul class="pre-list">$items</div></div></div>`;
  var html_item = `<li><a data-rel="$rel" href="#$next" data-val="$val" data-tk="$tk" data-gd="$gd">$item</a></li>`;
  for (let i = 0; i < questions.length; i++) {
    var html_question = html_template
      .replace("$id", "q-" + (i + 1))
      .replace("$question", questions[i].question);
    question_ids.push("q-" + (i + 1));
    var html_items = "";
    for (let j = 0; j < questions[i].answers.length; j++) {
      html_items += html_item
        .replace("$item", questions[i].answers[j].text)
        .replace("$rel", i < questions.length - 1 ? "popup" : "back")
        .replace("$next", i < questions.length - 1 ? "q-" + (i + 2) : "")
        .replace("$val", questions[i].answers[j].value)
        .replace("$tk", questions[i].property)
        .replace("$gd", questions[i].gameDescriptor);
    }
    insertHTML(html_question.replace("$items", html_items), selector);
  }
  return question_ids;
}
