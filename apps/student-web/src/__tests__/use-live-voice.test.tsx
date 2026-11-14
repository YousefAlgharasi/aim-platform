import { act, renderHook } from '@testing-library/react';
import { useLiveVoice } from '../features/voice-teacher/useLiveVoice';

// A microphone permission prompt that the test resolves by hand, so the hook can be stopped while it is still open.
function installMic() {
  let grant: (stream: MediaStream) => void = () => undefined;
  const track = { stop: jest.fn() };
  const stream = { getTracks: () => [track] } as unknown as MediaStream;
  const getUserMedia = jest.fn(() => new Promise<MediaStream>((resolve) => { grant = resolve; }));
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true });
  class FakeAudioContext {
    state = 'running';
    sampleRate = 48_000;
    destination = {};
    resume = jest.fn(async () => undefined);
    close = jest.fn(async () => undefined);
    createMediaStreamSource = () => ({ connect: jest.fn() });
    createScriptProcessor = () => ({ connect: jest.fn(), disconnect: jest.fn(), onaudioprocess: null });
    createGain = () => ({ gain: { value: 1 }, connect: jest.fn() });
  }
  (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
  return { track, getUserMedia, grant: () => grant(stream) };
}

const options = { onUtterance: jest.fn(), onBargeIn: jest.fn(), isAiSpeaking: () => false };

describe('useLiveVoice', () => {
  it('releases the microphone when it is stopped before the browser finished opening it', async () => {
    const mic = installMic();
    const { result } = renderHook(() => useLiveVoice(options));
    let starting!: Promise<void>;
    act(() => { starting = result.current.start(); });
    act(() => result.current.stop());
    await act(async () => { mic.grant(); await starting; });
    expect(mic.track.stop).toHaveBeenCalled();
    expect(result.current.status).toBe('off');
  });

  it('releases the microphone when the page is left while it is opening', async () => {
    const mic = installMic();
    const { result, unmount } = renderHook(() => useLiveVoice(options));
    let starting!: Promise<void>;
    act(() => { starting = result.current.start(); });
    unmount();
    await act(async () => { mic.grant(); await starting; });
    expect(mic.track.stop).toHaveBeenCalled();
  });

  it('opens the microphone only once when start is pressed twice', async () => {
    const mic = installMic();
    const { result } = renderHook(() => useLiveVoice(options));
    await act(async () => {
      const a = result.current.start();
      const b = result.current.start();
      mic.grant();
      await Promise.all([a, b]);
    });
    expect(mic.getUserMedia).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('listening');
  });
});
