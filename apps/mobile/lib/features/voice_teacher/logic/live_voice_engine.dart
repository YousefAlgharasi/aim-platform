// The pure part of the live conversation (ported from the student web app so both behave the same): deciding when
// the student starts and stops talking, and packaging one spoken sentence as a WAV file the backend accepts.
// No plugins and no Flutter widgets here, so it is tested with plain numbers.

import 'dart:typed_data';

class VadOptions {
  const VadOptions({
    this.startMs = 120,
    this.bargeInStartMs = 380,
    this.endSilenceMs = 1100,
    this.minSpeechMs = 350,
    this.maxUtteranceMs = 60000,
    this.minLevel = 0.012,
    this.noiseFactor = 2.8,
    this.bargeInFactor = 2.2,
    this.calibrationMs = 600,
  });

  /// A burst this long (ms) counts as the student starting to talk.
  final int startMs;

  /// The same, while the teacher is speaking (stricter, so the teacher's own voice coming back is not mistaken for
  /// the student).
  final int bargeInStartMs;

  /// This much quiet (ms) after talking means the student finished.
  final int endSilenceMs;

  /// Sentences with less actual talking than this (ms) are noise, not speech.
  final int minSpeechMs;

  /// One sentence never lasts longer than this (ms).
  final int maxUtteranceMs;

  /// Quietest level that can count as speech (0..1 RMS).
  final double minLevel;

  /// Speech must be this many times louder than the background noise.
  final double noiseFactor;

  /// While the teacher is speaking the student must be this much louder to interrupt.
  final double bargeInFactor;

  /// After the mic opens, this long (ms) is spent only learning the room's background noise level.
  final int calibrationMs;
}

sealed class VadEvent {
  const VadEvent();
}

class SpeechStart extends VadEvent {
  const SpeechStart({required this.bargeIn});

  /// True when the student started talking while the teacher was speaking (an interruption).
  final bool bargeIn;
}

class SpeechEnd extends VadEvent {
  const SpeechEnd({required this.tooShort});

  /// A click or a cough: not worth sending.
  final bool tooShort;
}

/// Frame-by-frame voice activity detection. Feed it the loudness (RMS, 0..1) of each audio frame with the frame
/// length; it answers with "the student started talking" / "the student finished". It learns the background noise
/// level while nobody talks, so a noisy room does not keep it open.
class Vad {
  Vad([this.options = const VadOptions()]);

  final VadOptions options;
  bool _inSpeech = false;
  double _candidateMs = 0;
  double _speechMs = 0;
  double _silenceMs = 0;
  double _totalMs = 0;
  double _calibratedMs = 0;
  double noiseFloor = 0.004;

  bool get talking => _inSpeech;

  /// The loudness a frame must exceed to count as speech right now.
  double threshold(bool aiSpeaking) {
    final base = _max(options.minLevel, noiseFloor * options.noiseFactor);
    return aiSpeaking ? base * options.bargeInFactor : base;
  }

  /// Call when the mic opens: the next moment is used to learn how loud the room is.
  void startCalibration() => _calibratedMs = 0;

  VadEvent? process(double rms, double frameMs, bool aiSpeaking) {
    if (_calibratedMs < options.calibrationMs) {
      _calibratedMs += frameMs;
      noiseFloor = _clamp(noiseFloor * 0.7 + rms * 0.3, 0.002, 0.05);
      return null;
    }
    final threshold = this.threshold(aiSpeaking);

    if (!_inSpeech) {
      if (rms > threshold) {
        _candidateMs += frameMs;
        final needed = aiSpeaking ? options.bargeInStartMs : options.startMs;
        if (_candidateMs >= needed) {
          _inSpeech = true;
          _speechMs = _candidateMs;
          _silenceMs = 0;
          _totalMs = _candidateMs;
          _candidateMs = 0;
          return SpeechStart(bargeIn: aiSpeaking);
        }
      } else {
        _candidateMs = _max(0, _candidateMs - frameMs * 2);
        // Learn the room's background level only while it is quiet and the teacher is not talking.
        if (!aiSpeaking) noiseFloor = _clamp(noiseFloor * 0.95 + rms * 0.05, 0.002, 0.05);
      }
      return null;
    }

    _totalMs += frameMs;
    // A little hysteresis: once talking, slightly quieter frames still count, so short dips do not cut a sentence.
    if (rms > threshold * 0.7) {
      _speechMs += frameMs;
      _silenceMs = 0;
    } else {
      _silenceMs += frameMs;
    }
    if (_silenceMs >= options.endSilenceMs || _totalMs >= options.maxUtteranceMs) {
      final tooShort = _speechMs < options.minSpeechMs;
      reset();
      return SpeechEnd(tooShort: tooShort);
    }
    return null;
  }

  /// Forget the current sentence (e.g. the mic was muted).
  void reset() {
    _inSpeech = false;
    _candidateMs = 0;
    _speechMs = 0;
    _silenceMs = 0;
    _totalMs = 0;
  }

  static double _max(double a, double b) => a > b ? a : b;
  static double _clamp(double v, double lo, double hi) => v < lo ? lo : (v > hi ? hi : v);
}

/// The sample rate used for live audio: plenty for speech, and small (about 32 KB per second of talking).
const int liveSampleRate = 16000;

/// Loudness (RMS, 0..1) of a buffer of little-endian 16-bit mono PCM.
double pcm16Rms(Uint8List pcm) {
  final samples = pcm.lengthInBytes ~/ 2;
  if (samples == 0) return 0;
  final view = ByteData.sublistView(pcm);
  var sum = 0.0;
  for (var i = 0; i < samples; i++) {
    final v = view.getInt16(i * 2, Endian.little) / 32768.0;
    sum += v * v;
  }
  return _sqrt(sum / samples);
}

double _sqrt(double x) {
  if (x <= 0) return 0;
  var g = x > 1 ? x / 2 : 1.0;
  for (var i = 0; i < 24; i++) {
    g = 0.5 * (g + x / g);
  }
  return g;
}

/// Wraps raw 16-bit mono PCM in a WAV header (audio/wav is accepted by the voice teacher backend).
Uint8List wrapPcm16AsWav(Uint8List pcm, {int sampleRate = liveSampleRate}) {
  final dataLength = pcm.lengthInBytes;
  final out = Uint8List(44 + dataLength);
  final view = ByteData.sublistView(out);
  void text(int offset, String s) {
    for (var i = 0; i < s.length; i++) {
      out[offset + i] = s.codeUnitAt(i);
    }
  }

  text(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, Endian.little);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, Endian.little);
  view.setUint16(20, 1, Endian.little); // PCM
  view.setUint16(22, 1, Endian.little); // mono
  view.setUint32(24, sampleRate, Endian.little);
  view.setUint32(28, sampleRate * 2, Endian.little);
  view.setUint16(32, 2, Endian.little);
  view.setUint16(34, 16, Endian.little);
  text(36, 'data');
  view.setUint32(40, dataLength, Endian.little);
  out.setRange(44, 44 + dataLength, pcm);
  return out;
}

/// Joins PCM chunks in order.
Uint8List concatPcm(List<Uint8List> chunks) {
  var length = 0;
  for (final c in chunks) {
    length += c.lengthInBytes;
  }
  final out = Uint8List(length);
  var offset = 0;
  for (final c in chunks) {
    out.setRange(offset, offset + c.lengthInBytes, c);
    offset += c.lengthInBytes;
  }
  return out;
}
