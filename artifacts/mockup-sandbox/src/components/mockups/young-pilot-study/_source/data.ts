export type Lesson = { id: string; title: string; topic: string; body: string; keyPoint: string };
export type Flashcard = { id: string; term: string; definition: string };
export type QuizQuestion = { id: string; prompt: string; choices: string[]; correctAnswer: string; explanation: string };
export type QuizScore = { date: string; correct: number; total: number; percentage: number };

export const lessons: Lesson[] = [
  {
    id: 'airplane-parts', title: 'Meet the airplane', topic: 'Airplane parts',
    body: 'A small airplane is a collection of parts working together. The wings create lift as air moves around them. The fuselage is the main body that holds the cockpit and passengers. The tail helps keep the airplane stable, while the rudder and elevators help the pilot control direction and pitch. The engine provides thrust, and the landing gear supports the airplane on the ground.',
    keyPoint: 'Wings, tail surfaces, engine, fuselage, and landing gear each have different jobs—and pilots learn to inspect them before flight.',
  },
  {
    id: 'cockpit-instruments', title: 'Read the panel', topic: 'Cockpit instruments',
    body: 'A cockpit panel gives the pilot information about the airplane and its flight. Many training airplanes have instruments showing attitude, altitude, airspeed, direction, and engine information. The altimeter indicates altitude above a reference pressure setting; the airspeed indicator shows speed through the air. Pilots learn to cross-check instruments rather than rely on just one.',
    keyPoint: 'Instruments are information sources, not autopilot. Pilots interpret them together with what they see outside.',
  },
  {
    id: 'aviation-vocabulary', title: 'Speak aviation', topic: 'Aviation vocabulary',
    body: 'A few words come up again and again. Altitude describes height above a reference level. Heading is the direction the nose points, while course is the intended path over the ground. A runway is a prepared surface for takeoff and landing. “Airspeed” is speed relative to the surrounding air, which is not always the same as speed over the ground.',
    keyPoint: 'Heading and course are related but different: one points the airplane, the other describes its path.',
  },
  {
    id: 'flight-principles', title: 'Why airplanes fly', topic: 'Basic flight principles',
    body: 'Four forces are useful for understanding flight: lift, weight, thrust, and drag. Lift acts generally upward, weight downward, thrust forward, and drag opposite the airplane’s motion through the air. Their balance changes as an airplane climbs, descends, accelerates, or slows. This is a simple learning model; real aerodynamics involve many interacting factors.',
    keyPoint: 'Flight is about managing four forces: lift, weight, thrust, and drag.',
  },
];

export const flashcards: Flashcard[] = [
  { id: 'lift', term: 'Lift', definition: 'An aerodynamic force that acts generally upward and helps support an airplane in flight.' },
  { id: 'fuselage', term: 'Fuselage', definition: 'The main body of an airplane, where the cockpit and often passengers or cargo are located.' },
  { id: 'altimeter', term: 'Altimeter', definition: 'An instrument that indicates altitude based on atmospheric pressure and a selected pressure setting.' },
  { id: 'airspeed', term: 'Airspeed', definition: 'The airplane’s speed relative to the air around it; it can differ from speed over the ground.' },
  { id: 'rudder', term: 'Rudder', definition: 'A movable surface on the vertical tail that helps control yaw, the airplane’s nose moving left or right.' },
  { id: 'runway', term: 'Runway', definition: 'A defined surface at an airport prepared for airplanes to take off and land.' },
  { id: 'thrust', term: 'Thrust', definition: 'A forward force produced by an airplane’s engine and propeller or jet engine.' },
  { id: 'heading', term: 'Heading', definition: 'The direction the nose of the airplane is pointed, usually expressed in degrees.' },
  { id: 'drag', term: 'Drag', definition: 'Aerodynamic resistance that acts opposite an airplane’s motion through the air.' },
];

export const questions: QuizQuestion[] = [
  { id: 'q-lift', prompt: 'Which airplane part produces most of the lift in ordinary level flight?', choices: ['The landing gear', 'The wings', 'The rudder', 'The windshield'], correctAnswer: 'The wings', explanation: 'The wings are shaped and positioned to create lift as air flows around them.' },
  { id: 'q-altimeter', prompt: 'What does an altimeter indicate?', choices: ['Altitude', 'Engine temperature', 'Wind direction', 'Fuel quantity'], correctAnswer: 'Altitude', explanation: 'An altimeter uses atmospheric pressure and a setting to indicate altitude.' },
  { id: 'q-four-forces', prompt: 'Which set lists the four basic forces commonly used to describe flight?', choices: ['Lift, weight, thrust, and drag', 'Speed, fuel, course, and heading', 'Pitch, roll, yaw, and trim', 'Wings, tail, engine, and gear'], correctAnswer: 'Lift, weight, thrust, and drag', explanation: 'These forces provide a useful beginner model of what acts on an airplane in flight.' },
  { id: 'q-fuselage', prompt: 'What is the fuselage?', choices: ['The airplane’s main body', 'A cockpit compass', 'The front wheel only', 'A type of cloud'], correctAnswer: 'The airplane’s main body', explanation: 'The fuselage is the central body of the airplane, including the cockpit area.' },
  { id: 'q-heading', prompt: 'What does heading describe?', choices: ['The nose direction of the airplane', 'Its altitude above sea level', 'The length of a runway', 'Its speed over the ground'], correctAnswer: 'The nose direction of the airplane', explanation: 'Heading is where the nose points; course is the intended path over the ground.' },
  { id: 'q-airspeed', prompt: 'Airspeed is the airplane’s speed relative to what?', choices: ['The air around it', 'The runway markings', 'The airport tower', 'The ground only'], correctAnswer: 'The air around it', explanation: 'Airspeed is measured relative to the surrounding air and may differ from ground speed.' },
  { id: 'q-rudder', prompt: 'Which control surface is attached to the vertical tail?', choices: ['Rudder', 'Flap', 'Aileron', 'Elevator'], correctAnswer: 'Rudder', explanation: 'The rudder is on the vertical tail and helps control yaw.' },
];

