import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchStudentCourses, type StudentCourse } from '../curriculum/curriculumApi';
import { fetchLatestPlacementStatus } from '../placement/placementApi';
import { bandOf, effectiveBand, type Band } from './bands';

interface LevelState {
  loading: boolean;
  /** The level lessons, courses and practice should match. Null until the student has a placement result or progress. */
  band: Band | null;
  /** What the placement test found, if taken. */
  placementBand: Band | null;
  hasPlacement: boolean;
  courses: StudentCourse[];
  refresh: () => void;
}

const LevelContext = createContext<LevelState | null>(null);

/** One place that knows the student's level, so every page agrees (placement result + finished courses). */
export function LevelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isStudent = !!user?.roles.includes('student');
  const [loading, setLoading] = useState(isStudent);
  const [placementBand, setPlacementBand] = useState<Band | null>(null);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!isStudent) { setLoading(false); return; }
    let cancelled = false;
    Promise.allSettled([fetchLatestPlacementStatus(), fetchStudentCourses()]).then(([p, c]) => {
      if (cancelled) return;
      setPlacementBand(p.status === 'fulfilled' && p.value.result ? bandOf(p.value.result.estimated_level) : null);
      setCourses(c.status === 'fulfilled' ? c.value : []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isStudent, user?.id, tick]);

  const value = useMemo<LevelState>(
    () => ({ loading, placementBand, hasPlacement: placementBand !== null, courses, band: effectiveBand(placementBand, courses), refresh }),
    [loading, placementBand, courses, refresh],
  );
  return <LevelContext.Provider value={value}>{children}</LevelContext.Provider>;
}

const FALLBACK: LevelState = { loading: false, band: null, placementBand: null, hasPlacement: false, courses: [], refresh: () => undefined };
export function useLearnerLevel(): LevelState {
  return useContext(LevelContext) ?? FALLBACK;
}
