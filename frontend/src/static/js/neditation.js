const exercises = {
  bodyScan: {
    title: "Body Scan Meditation",
    content: `<p>Focus on each part of your body. Start from toes to head.</p>
              <img src="https://media.giphy.com/media/26xBI73gWquCBBCDe/giphy.gif" alt="Body Scan GIF">`,
    duration: 300 // seconds
  },
  mindfulness: {
    title: "Mindfulness Meditation",
    content: `<p>Focus on your thoughts and feelings without judgment.</p>
              <iframe width="100%" height="200" src="https://www.youtube.com/embed/2OEL4P1Rz04" frameborder="0" allowfullscreen></iframe>`,
    duration: 420
  },
  breathingFocus: {
    title: "Breathing Focus Meditation",
    content: `<p>Concentrate on your breath. Inhale deeply, exhale slowly.</p>
              <img src="https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif" alt="Breathing GIF">`,
    duration: 300
  }
};

let timerInterval;
let timeLeft = 0;

function openExercise(key){
  const modal = document.getElementById("exerciseModal");
  modal.style.display = "flex";
  document.getElementById("exerciseTitle").innerHTML = exercises[key].title;
  document.getElementById("exerciseContent").innerHTML = exercises[key].content;
  timeLeft = exercises[key].duration;
  document.getElementById("timer").innerText = formatTime(timeLeft);
}

function closeExercise(){
  document.getElementById("exerciseModal").style.display = "none";
  clearInterval(timerInterval);
}

function startTimer(){
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      alert("Exercise Complete!");
    } else {
      timeLeft--;
      document.getElementById("timer").innerText = formatTime(timeLeft);
    }
  }, 1000);
}

function resetTimer(){
  clearInterval(timerInterval);
  document.getElementById("timer").innerText = formatTime(timeLeft);
}

function formatTime(seconds){
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}
