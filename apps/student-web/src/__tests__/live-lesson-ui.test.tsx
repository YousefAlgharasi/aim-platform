import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { LessonStart } from '../features/lessons/LessonStart';
import { VoiceComposer } from '../features/voice-teacher/VoiceComposer';
import { CHARACTERS } from '../features/lessons/dialogue/characters';

jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({ t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])) }),
}));
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
  useNavigate: () => jest.fn(),
}));

describe('LessonStart', () => {
  const base = { lessonId: 'l-1', title: 'Present Simple', guide: CHARACTERS.adam, completed: false, locked: false };

  it('offers the live AI lesson first and reading with a named character second', () => {
    const onRead = jest.fn();
    render(<LessonStart {...base} onRead={onRead} />);
    expect(screen.getByRole('heading', { name: 'Present Simple', level: 1 })).toBeInTheDocument();
    const live = screen.getByRole('link', { name: 'Start live lesson' });
    expect(live).toHaveAttribute('href', '/voice-teacher?lessonId=l-1&lessonTitle=Present%20Simple');
    const read = screen.getByRole('button', { name: /Read it with Adam/ });
    fireEvent.click(read);
    expect(onRead).toHaveBeenCalledTimes(1);
    // The live lesson comes before the reading option on the page.
    expect(live.compareDocumentPosition(read) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the completed badge and the locked notice', () => {
    render(<LessonStart {...base} completed locked onRead={() => undefined} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText(/Complete the previous lesson/)).toBeInTheDocument();
  });
});

describe('VoiceComposer', () => {
  const props = {
    draft: '', onDraftChange: jest.fn(), onSend: jest.fn(), onMicToggle: jest.fn(),
    micState: 'on' as const, busy: false, muted: false, onToggleMute: jest.fn(),
    robotState: 'idle' as const, level: 0, thought: null,
  };
  beforeEach(() => jest.clearAllMocks());

  it('the mic button is the live microphone: tap it to mute, tap again to turn it on', () => {
    const { rerender } = render(<VoiceComposer {...props} />);
    const mic = screen.getByRole('button', { name: 'Mute your microphone' });
    expect(mic).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(mic);
    expect(props.onMicToggle).toHaveBeenCalledTimes(1);

    rerender(<VoiceComposer {...props} micState="muted" />);
    expect(screen.getByRole('button', { name: 'Turn your microphone on' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows a way to start the live conversation when the mic is off', () => {
    render(<VoiceComposer {...props} micState="off" />);
    fireEvent.click(screen.getByRole('button', { name: 'Start live conversation' }));
    expect(props.onMicToggle).toHaveBeenCalledTimes(1);
  });

  it('says to just talk while live, and to type or talk otherwise', () => {
    const { rerender } = render(<VoiceComposer {...props} micState="hearing" />);
    expect(screen.getByPlaceholderText('Just talk, or type here')).toBeInTheDocument();
    rerender(<VoiceComposer {...props} micState="muted" />);
    expect(screen.getByPlaceholderText('Type or talk to your teacher')).toBeInTheDocument();
  });

  it('sends only once something is typed (the send button is disabled while the box is empty)', () => {
    const { rerender } = render(<VoiceComposer {...props} />);
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    rerender(<VoiceComposer {...props} draft="Hello teacher" />);
    const send = screen.getByRole('button', { name: 'Send message' });
    expect(send).toBeEnabled();
    fireEvent.click(send);
    expect(props.onSend).toHaveBeenCalledTimes(1);
  });

  it('keeps the microphone and the teacher-voice buttons inside the box even while typing', () => {
    render(<VoiceComposer {...props} draft="Hello" />);
    expect(screen.getByRole('button', { name: 'Mute your microphone' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mute the teacher’s voice' })).toBeInTheDocument();
  });

  it('shows what the robot is saying as a thought bubble, and a newer message replaces it', () => {
    const { rerender, container } = render(<VoiceComposer {...props} robotState="speaking" thought={{ id: 'a', text: 'We use the present simple for habits.', typing: false }} />);
    expect(screen.getByText('We use the present simple for habits.')).toBeInTheDocument();
    expect(container.querySelector('.vr-robot')).toHaveAttribute('data-state', 'speaking');
    rerender(<VoiceComposer {...props} robotState="speaking" thought={{ id: 'b', text: 'Now say a sentence.', typing: true }} />);
    expect(screen.getByText('Now say a sentence.')).toBeInTheDocument();
    // The old bubble is still there for a moment, fading behind the new one.
    expect(container.querySelector('.vr-bubble-out')).not.toBeNull();
    expect(container.querySelector('.vr-caret')).not.toBeNull();
  });

  it('shows no bubble when the robot has nothing to say yet', () => {
    const { container } = render(<VoiceComposer {...props} />);
    expect(container.querySelector('.vr-bubble')).toBeNull();
  });

  it('sends on Enter, keeps Shift+Enter for a new line, and ignores empty text', () => {
    const { rerender } = render(<VoiceComposer {...props} draft="Hi" />);
    const box = screen.getByRole('textbox', { name: 'Message your teacher' });
    fireEvent.keyDown(box, { key: 'Enter', shiftKey: true });
    expect(props.onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(props.onSend).toHaveBeenCalledTimes(1);
    rerender(<VoiceComposer {...props} draft="   " />);
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message your teacher' }), { key: 'Enter' });
    expect(props.onSend).toHaveBeenCalledTimes(1);
  });

  it('lets the student mute the teacher and shows when it is muted', () => {
    const { rerender } = render(<VoiceComposer {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mute the teacher’s voice' }));
    expect(props.onToggleMute).toHaveBeenCalledTimes(1);
    rerender(<VoiceComposer {...props} muted />);
    expect(screen.getByRole('button', { name: 'Turn the teacher’s voice on' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('typing still works when live voice is not available; the mic is disabled', () => {
    render(<VoiceComposer {...props} micState="blocked" />);
    expect(screen.getByRole('button', { name: /isn’t available here/ })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Message your teacher' })).toBeEnabled();
  });
});
