// Global variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let markedForReview = new Set(); // To track questions marked for review

// Fetch questions from the API
async function fetchQuestions() {
  showLoader();
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const data = await response.json();
    questions = data.results.map((q) => ({
      question: q.question,
      options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
      answer: q.correct_answer,
      selected: null, // Track user-selected answers
    }));
    hideLoader();
    showQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
    document.getElementById('quiz-container').innerHTML = `
      <div class="alert alert-danger" role="alert">
        Unable to load questions. Please try again later.
      </div>`;
  }
}

// Shuffle options for each question
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Show loader
function showLoader() {
  document.getElementById('loader').style.display = 'block';
  document.getElementById('quiz-container').style.display = 'none';
}

// Hide loader
function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
}

// Display the current question
function showQuestion() {
  const quizContainer = document.getElementById('quiz-container');
  const question = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  quizContainer.innerHTML = `
    <div class="progress mb-3">
      <div
        class="progress-bar"
        role="progressbar"
        style="width: ${progressPercentage}%"
        aria-valuenow="${progressPercentage}"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
    <div class="card mb-4 ${markedForReview.has(currentQuestionIndex) ? "marked" : ""}">
      <div class="card-body">
        <h5 class="card-title">${decodeHTML(question.question)}</h5>
        <div>
          ${question.options
            .map(
              (option, index) =>
                `<button class="btn ${
                  question.selected === option ? "btn-primary" : "btn-outline-primary"
                } d-block mb-2" onclick="selectAnswer('${option}')">${decodeHTML(option)}</button>`
            )
            .join('')}
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-between">
      <button class="btn btn-secondary mx-2" onclick="previousQuestion()" ${currentQuestionIndex === 0 ? "disabled" : ""}>Previous</button>
      <button class="btn btn-warning mx-2" onclick="markForReview()">Mark for Review</button>
      <button class="btn btn-secondary mx-2" onclick="nextQuestion()" ${currentQuestionIndex === questions.length - 1 ? "disabled" : ""}>Next</button>
      <button class="btn btn-success mx-2" onclick="submitQuiz()">Submit</button>
    </div>
  `;
}

// Handle answer selection
function selectAnswer(selectedOption) {
  questions[currentQuestionIndex].selected = selectedOption;
  showQuestion();
}

// Mark question for review
function markForReview() {
  if (markedForReview.has(currentQuestionIndex)) {
    markedForReview.delete(currentQuestionIndex);
  } else {
    markedForReview.add(currentQuestionIndex);
  }
  showQuestion();
}

// Move to the next question
function nextQuestion() {
  currentQuestionIndex++;
  showQuestion();
}

// Move to the previous question
function previousQuestion() {
  currentQuestionIndex--;
  showQuestion();
}

// Submit the quiz
function submitQuiz() {
  const correctAnswers = questions.filter((q) => q.selected === q.answer).length;
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = `
    <div class="card">
      <div class="card-body text-center">
        <h5 class="card-title">Quiz Submitted!</h5>
        <p>Your score is ${correctAnswers} out of ${questions.length}.</p>
        <button class="btn btn-primary" onclick="restartQuiz()">Restart Quiz</button>
      </div>
    </div>
  `;
}

// Restart the quiz
function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  markedForReview.clear();
  fetchQuestions();
}

// Utility function to decode HTML entities
function decodeHTML(html) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  return textArea.value;
}

// Initialize the quiz
fetchQuestions();
