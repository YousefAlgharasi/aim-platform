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
    draft: '', onDraftChange: jest.fn(), onSend: jest.fn(), onMic: jest.fn(), onCancelRecording: jest.fn(),
    isRecording: false, elapsedLabel: '0:03', busy: false, micBlocked: false, micRequesting: false, muted: false, onToggleMute: jest.fn(),
  };
  beforeEach(() => jest.clearAllMocks());

  it('is a mic while the box is empty and a send button once something is typed', () => {
    const { rerender } = render(<VoiceComposer {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
    expect(props.onMic).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();

    rerender(<VoiceComposer {...props} draft="Hello teacher" />);
    expect(screen.queryByRole('button', { name: 'Start recording' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(props.onSend).toHaveBeenCalledTimes(1);
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

  it('while recording shows the meter with stop and cancel, and no text box', () => {
    render(<VoiceComposer {...props} isRecording />);
    expect(screen.getByText('Listening…')).toBeInTheDocument();
    expect(screen.getByText('0:03')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(props.onCancelRecording).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording and send' }));
    expect(props.onMic).toHaveBeenCalledTimes(1);
  });

  it('lets the student mute the teacher and shows when it is muted', () => {
    const { rerender } = render(<VoiceComposer {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mute the teacher’s voice' }));
    expect(props.onToggleMute).toHaveBeenCalledTimes(1);
    rerender(<VoiceComposer {...props} muted />);
    expect(screen.getByRole('button', { name: 'Turn the teacher’s voice on' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('typing still works when the microphone is blocked; the mic is disabled', () => {
    render(<VoiceComposer {...props} micBlocked />);
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Message your teacher' })).toBeEnabled();
  });
});
