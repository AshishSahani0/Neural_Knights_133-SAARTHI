// ================================
// Breathing Exercises Logic
// ================================

let currentStepIndex = 0;
let currentRound = 1;
let intervalId = null;
let isPaused = false;
let voiceOn = true;
let ambientOn = true;

const instructionText = document.getElementById("instructionText");
const timerDisplay = document.getElementById("timer");
const roundsDisplay = document.getElementById("rounds");
const exercisePanel = document.querySelector(".exercise-panel");
const circle = document.getElementById("breathingCircle");
const ambientAudio = document.getElementById("ambientAudio");
const stepsList = document.getElementById("stepsList");

let currentExercise = null;

// Define breathing patterns
const exercises = {
  "4-7-8": {
    name: "4-7-8 Breathing",
    steps: [
      { text: "Inhale deeply", duration: 4 },
      { text: "Hold your breath", duration: 7 },
      { text: "Exhale slowly", duration: 8 },
    ],
    rounds: 3
  },
  "Box": {
    name: "Box Breathing",
    steps: [
      { text: "Inhale deeply", duration: 4 },
      { text: "Hold your breath", duration: 4 },
      { text: "Exhale slowly", duration: 4 },
      { text: "Hold again", duration: 4 },
    ],
    rounds: 3
  }
};

// ================================
// Start Exercise
// ================================
function startExercise(type) {
  currentExercise = exercises[type];
  if (!currentExercise) return;

  document.getElementById("exerciseName").innerText = currentExercise.name;

  currentStepIndex = 0;
  currentRound = 1;
  isPaused = false;

  exercisePanel.style.display = "block";
  if (ambientOn) ambientAudio.play();

  displayStepsList();
  startStep();
}

// ================================
// Display Steps List
// ================================
function displayStepsList() {
  stepsList.innerHTML = "";
  currentExercise.steps.forEach((step, idx) => {
    const li = document.createElement("li");
    li.innerText = step.text;
    li.id = `step-${idx}`;
    stepsList.appendChild(li);
  });
}

// ================================
// Handle Each Step
// ================================
function startStep() {
  if (currentRound > currentExercise.rounds) {
    resetExercise();
    return;
  }

  const step = currentExercise.steps[currentStepIndex];
  let timeLeft = step.duration;

  // Update UI
  instructionText.innerText = step.text;
  timerDisplay.innerText = `⏳ ${timeLeft}s`;
  roundsDisplay && (roundsDisplay.innerText = `Round: ${currentRound} / ${currentExercise.rounds}`);

  highlightCurrentStep(currentStepIndex);
  speak(step.text);

  // Circle animation sync
  circle.style.animation = "none";
  void circle.offsetWidth; // reset animation
  circle.style.animation = step.text.includes("Inhale")
    ? `expand ${step.duration}s linear`
    : step.text.includes("Exhale")
    ? `contract ${step.duration}s linear`
    : `hold ${step.duration}s linear`;

  // Timer countdown
  intervalId = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      timerDisplay.innerText = `⏳ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(intervalId);
        nextStep();
      }
    }
  }, 1000);
}

// ================================
// Highlight Current Step
// ================================
function highlightCurrentStep(index) {
  currentExercise.steps.forEach((_, idx) => {
    const el = document.getElementById(`step-${idx}`);
    if (el) el.style.fontWeight = idx === index ? "700" : "400";
  });
}

// ================================
// Move to Next Step
// ================================
function nextStep() {
  currentStepIndex++;
  if (currentStepIndex >= currentExercise.steps.length) {
    currentStepIndex = 0;
    currentRound++;
  }
  startStep();
}

// ================================
// Pause / Resume
// ================================
function pauseExercise() {
  isPaused = !isPaused;
}

// ================================
// Reset Exercise
// ================================
function resetExercise() {
  clearInterval(intervalId);
  exercisePanel.style.display = "none";
  ambientAudio.pause();
  ambientAudio.currentTime = 0;
  window.speechSynthesis.cancel();
}

// ================================
// Voice Toggle
// ================================
function toggleVoice() {
  voiceOn = !voiceOn;
  document.getElementById("voiceBtn").innerText = voiceOn ? "🔊 Voice: On" : "🔇 Voice: Off";
}

// ================================
// Ambient Toggle
// ================================
function toggleAmbient() {
  ambientOn = !ambientOn;
  if (ambientOn) ambientAudio.play();
  else ambientAudio.pause();
  document.getElementById("ambientBtn").innerText = ambientOn ? "🎶 Ambient: On" : "🎶 Ambient: Off";
}

// ================================
// Text-to-Speech
// ================================
function speak(text) {
  if (!voiceOn) return;
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.cancel(); // stop overlapping
    window.speechSynthesis.speak(utterance);
  }
}

// ================================
// Close panel if user clicks outside
// ================================
window.onclick = function (event) {
  if (event.target == exercisePanel) {
    resetExercise();
  }
};

// ================================
// Start Button Event
// ================================
document.getElementById("startBtn").addEventListener("click", () => {
  const selectedType = document.getElementById("exerciseType").value;
  startExercise(selectedType);
});

document.getElementById("pauseBtn").addEventListener("click", pauseExercise);
document.getElementById("resetBtn").addEventListener("click", resetExercise);
