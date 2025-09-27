export const PHQ9 = [
  { question: "Little interest or pleasure in doing things?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Feeling down, depressed, or hopeless?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Trouble falling or staying asleep, or sleeping too much?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Feeling tired or having little energy?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Poor appetite or overeating?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Trouble concentrating on things, such as reading the newspaper or watching television?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Thoughts that you would be better off dead or of hurting yourself in some way?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
];

export const GAD7 = [
  { question: "Feeling nervous, anxious, or on edge?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Not being able to stop or control worrying?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Worrying too much about different things?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Trouble relaxing?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Being so restless that it's hard to sit still?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Becoming easily annoyed or irritable?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { question: "Feeling afraid as if something awful might happen?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
];

export const GHQ = [
  // Negatively worded items
  { question: "Lost much sleep over worry?", options: ["Not at all", "No more than usual", "Rather more than usual", "Much more than usual"] },
  { question: "Felt constantly under strain?", options: ["Not at all", "No more than usual", "Rather more than usual", "Much more than usual"] },
  { question: "Felt you couldn’t overcome your difficulties?", options: ["Not at all", "No more than usual", "Rather more than usual", "Much more than usual"] },
  { question: "Been feeling unhappy and depressed?", options: ["Not at all", "No more than usual", "Rather more than usual", "Much more than usual"] },
  { question: "Been losing confidence in yourself?", options: ["Not at all", "No more than usual", "Rather more than usual", "Much more than usual"] },
  { question: "Been thinking of yourself as a worthless person?", options: ["Not at all", "No more than usual", "Rather more than usual", "Much more than usual"] },
  
  // Positively worded items (with corresponding options)
  { question: "Been able to concentrate on whatever you’re doing?", options: ["Better than usual", "Same as usual", "Less than usual", "Much less than usual"] },
  { question: "Felt that you are playing a useful part in things?", options: ["More so than usual", "Same as usual", "Less so than usual", "Much less than usual"] },
  { question: "Felt capable of making decisions about things?", options: ["More so than usual", "Same as usual", "Less so than usual", "Much less than usual"] },
  { question: "Been able to enjoy your normal day-to-day activities?", options: ["More so than usual", "Same as usual", "Less so than usual", "Much less than usual"] },
  { question: "Been able to face up to your problems?", options: ["More so than usual", "Same as usual", "Less able than usual", "Much less able than usual"] },
  { question: "Been feeling reasonably happy, all things considered?", options: ["More so than usual", "About the same as usual", "Less so than usual", "Much less than usual"] }
];

export const ALL_QUESTIONS = [...PHQ9, ...GAD7, ...GHQ];