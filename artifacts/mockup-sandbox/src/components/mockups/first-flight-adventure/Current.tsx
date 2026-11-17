import { useState } from 'react';
import Game from './Game';
import {
  INITIAL_FIRST_FLIGHT_PROGRESS,
  recordFirstFlightCompletion,
  type FirstFlightRunResult,
} from './firstFlightGame';
import './_group.css';

export function Current() {
  const [progress, setProgress] = useState(INITIAL_FIRST_FLIGHT_PROGRESS);
  const onComplete = (result: FirstFlightRunResult) => {
    setProgress((current) => recordFirstFlightCompletion(current, result));
    return true;
  };
  return <Game progress={progress} onComplete={onComplete} />;
}
