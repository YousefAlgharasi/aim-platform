import adam from '../../../assets/characters/adam.webp';
import adamAvatar from '../../../assets/characters/adam-avatar.webp';
import sarah from '../../../assets/characters/sarah.webp';
import sarahAvatar from '../../../assets/characters/sarah-avatar.webp';
import tariq from '../../../assets/characters/tariq.webp';
import tariqAvatar from '../../../assets/characters/tariq-avatar.webp';
import yasmin from '../../../assets/characters/yasmin.webp';
import yasminAvatar from '../../../assets/characters/yasmin-avatar.webp';

export type CharacterId = 'adam' | 'sarah' | 'tariq' | 'yasmin';
export type Gender = 'male' | 'female';

export interface Character {
  id: CharacterId;
  name: string;
  gender: Gender;
  /** Full-body cut-out (transparent WebP). */
  body: string;
  /** Head-and-shoulders cut-out, meant to sit in a circle. */
  avatar: string;
  /** Which way the artwork looks, so the scene can mirror it to face the other speaker. */
  faces: 'left' | 'right';
}

export const CHARACTERS: Record<CharacterId, Character> = {
  adam: { id: 'adam', name: 'Adam', gender: 'male', body: adam, avatar: adamAvatar, faces: 'left' },
  sarah: { id: 'sarah', name: 'Sarah', gender: 'female', body: sarah, avatar: sarahAvatar, faces: 'left' },
  tariq: { id: 'tariq', name: 'Tariq', gender: 'male', body: tariq, avatar: tariqAvatar, faces: 'right' },
  yasmin: { id: 'yasmin', name: 'Yasmin', gender: 'female', body: yasmin, avatar: yasminAvatar, faces: 'right' },
};

export const MALE_POOL: CharacterId[] = ['adam', 'tariq'];
export const FEMALE_POOL: CharacterId[] = ['sarah', 'yasmin'];
