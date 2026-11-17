import { useState } from 'react';
import AdventureGame from './AdventureGame';
import {
  INITIAL_FIRST_FLIGHT_PROGRESS,
  recordFirstFlightCompletion,
  type FirstFlightRunResult,
} from './firstFlightGame';
import './_group.css';

export function Adventure() {
  const [progress, setProgress] = useState(INITIAL_FIRST_FLIGHT_PROGRESS);
  const onComplete = (result: FirstFlightRunResult) => {
    setProgress((current) => recordFirstFlightCompletion(current, result));
    return true;
  };
  return <AdventureGame progress={progress} onComplete={onComplete} />;
}
