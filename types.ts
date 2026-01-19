
export interface DayMeditation {
  day: number;
  title: string;
  scripture: string;
  reflectionQuestion: string;
  practicalAction: string;
  prayer: string;
}

export interface WeeklyMeditationResult {
  sermonTitle: string;
  mainScripture: string;
  summary: string;
  meditations: DayMeditation[];
}
