// Which student character presents a lesson. The same lesson always gets the same presenter.
import { CHARACTERS, type Character, type CharacterId } from './characters';
import { hashSeed } from './dialogue';

const GUIDE_ORDER: CharacterId[] = ['sarah', 'adam', 'yasmin', 'tariq'];

/** The same lesson always gets the same presenter; different lessons rotate through the cast. */
export function pickGuide(lessonId: string): Character {
  return CHARACTERS[GUIDE_ORDER[hashSeed(lessonId) % GUIDE_ORDER.length]];
}
