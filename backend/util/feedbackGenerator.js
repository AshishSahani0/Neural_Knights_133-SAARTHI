export const getAIFeedback = ({ phqScore, gadScore, ghqScore }) => {
  let feedback = "";

  if (phqScore >= 20) feedback += "Severe depression symptoms. ";
  else if (phqScore >= 10) feedback += "Moderate depression detected. ";

  if (gadScore >= 15) feedback += "High anxiety levels. ";
  else if (gadScore >= 10) feedback += "Mild to moderate anxiety symptoms. ";

  if (ghqScore >= 14) feedback += "General health issues detected. ";

  if (!feedback) feedback = "Your responses indicate good overall mental health.";

  return feedback;
};
