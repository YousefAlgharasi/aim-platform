import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CertificateDetailPage } from '../features/certificates/CertificateDetailPage';
import { CERT_H, CERT_W, certificateFileName, drawCertificate, type CertificateImageData } from '../features/certificates/certificateImage';

/** A canvas context that records the text it is asked to draw. */
function fakeCtx() {
  const texts: string[] = [];
  const state: Record<string, unknown> = { font: '' };
  const ctx = new Proxy(state, {
    get(target, prop: string) {
      if (prop === 'fillText') return (t: string) => { texts.push(String(t)); };
      if (prop === 'measureText') {
        return (t: string) => ({ width: String(t).length * (parseInt(String(target.font).match(/(\d+)px/)?.[1] ?? '20', 10) * 0.55) });
      }
      if (prop in target) return target[prop];
      return () => undefined;
    },
    set(target, prop: string, value) { target[prop] = value; return true; },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, texts, state };
}

const data = (over: Partial<CertificateImageData> = {}): CertificateImageData => ({
  studentName: 'Yousef Ahmed', courseTitle: 'Starter', scorePercent: 66, issuedText: '6 November 2026', reference: '2749343A', rtl: false,
  formatNumber: (n) => String(n),
  labels: { brand: 'AIM English', title: 'Certificate of completion', presentedTo: 'This certificate is proudly presented to', forCompleting: 'for successfully completing', finalScore: 'Final score', issued: 'Issued', reference: 'Certificate ID' },
  ...over,
});

describe('drawCertificate', () => {
  it('prints the name, the course, the date and the mark out of 100 — and no link', () => {
    const { ctx, texts } = fakeCtx();
    drawCertificate(ctx, data());
    expect(texts).toEqual(expect.arrayContaining(['Yousef Ahmed', 'Starter', '6 November 2026', '\u206666 / 100\u2069', 'AIM English']));
    expect(texts.join(' ')).not.toMatch(/https?:|onrender|verify/i);
    expect(texts.some((x) => x.includes('2749343A'))).toBe(true);
  });

  it('leaves the mark out when there is no score yet, and the name line out when there is no name', () => {
    const { ctx, texts } = fakeCtx();
    drawCertificate(ctx, data({ scorePercent: null, studentName: null }));
    expect(texts.some((x) => x.includes('/ 100'))).toBe(false);
    expect(texts).not.toContain('Yousef Ahmed');
    expect(texts).toContain('Starter');
  });

  it('splits a very long course title over two lines instead of running off the page', () => {
    const { ctx, texts } = fakeCtx();
    const long = 'Advanced Business English for International Trade and Negotiation Skills Level Two';
    drawCertificate(ctx, data({ courseTitle: long }));
    const parts = texts.filter((x) => long.includes(x) && x !== long);
    expect(parts.length).toBeGreaterThanOrEqual(2);
    expect(parts.join(' ')).toBe(long);
  });

  it('lays out right-to-left for Arabic, and keeps the mark reading "73 / 100" with a left-to-right isolate', () => {
    const { ctx, state, texts } = fakeCtx();
    drawCertificate(ctx, data({ rtl: true, studentName: 'محمد القباطي', scorePercent: 73 }));
    expect(state.direction).toBe('rtl');
    expect(texts).toContain('\u206673 / 100\u2069');
  });

  it('is a landscape A4 picture', () => {
    expect(CERT_W / CERT_H).toBeCloseTo(1.414, 2);
  });
});

describe('certificateFileName', () => {
  it('makes a safe file name from the course title', () => {
    expect(certificateFileName('Starter')).toBe('certificate-Starter.png');
    expect(certificateFileName('A1.1: Beginner / Level')).toBe('certificate-A1-1-Beginner-Level.png');
    expect(certificateFileName('دورة المبتدئين')).toBe('certificate-دورة-المبتدئين.png');
    expect(certificateFileName('***')).toBe('certificate-course.png');
  });
});

// ---- the page ----------------------------------------------------------------------------------------------

jest.mock('react-router-dom', () => ({
  useParams: () => ({ certificateId: '2749343a-85ae-4336-9065-d730ca190007' }),
  useNavigate: () => jest.fn(),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
const mockI18n = {
  locale: 'en',
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  formatNumber: (n: number) => String(n),
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));
jest.mock('../i18n', () => ({ formatDate: () => '6 November 2026' }));

const mockFetch = jest.fn();
jest.mock('../features/certificates/certificatesApi', () => ({
  ...jest.requireActual('../features/certificates/certificatesApi'),
  fetchCertificate: (...a: unknown[]) => mockFetch(...a),
}));

const cert = {
  id: '2749343a-85ae-4336-9065-d730ca190007', studentId: 's', courseId: 'c', courseTitle: 'Starter', studentName: 'Yousef Ahmed',
  issuedAt: '2026-11-06T20:53:36Z', totalPoints: 659, overallScorePercent: 66,
  verificationUrl: 'https://aim-platform-gswy.onrender.com/certificates/2749343a-85ae-4336-9065-d730ca190007/verify',
  scoreSnapshot: [
    { assessmentId: 'q1', title: 'Chapter 1 Quiz', type: 'quiz', isFinalExam: false, score: 10, maxScore: 11, scorePercent: 91, passed: true },
    { assessmentId: 'fin', title: 'Starter Final Exam', type: 'exam', isFinalExam: true, score: 23, maxScore: 33, scorePercent: 70, passed: true },
  ],
  breakdown: {
    practicePoints: 180, practiceMaxPoints: 250, practiceAccuracyPercent: 72,
    quizPoints: 204, quizMaxPoints: 250, quizAveragePercent: 82,
    chapterExamPoints: 0, chapterExamMaxPoints: 0, chapterExamAveragePercent: 0,
    finalExamPoints: 275, finalExamMaxPoints: 500, finalExamPercent: 55,
    totalPoints: 659, maxPoints: 1000, overallPercent: 66,
  },
};

describe('CertificateDetailPage', () => {
  const realGetContext = HTMLCanvasElement.prototype.getContext;
  const realToBlob = HTMLCanvasElement.prototype.toBlob;
  let recorded: ReturnType<typeof fakeCtx>;

  beforeEach(() => {
    recorded = fakeCtx();
    HTMLCanvasElement.prototype.getContext = (() => recorded.ctx) as never;
    HTMLCanvasElement.prototype.toBlob = ((cb: (b: Blob | null) => void) => cb(new Blob(['png'], { type: 'image/png' }))) as never;
    mockFetch.mockResolvedValue(cert);
  });
  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = realGetContext;
    HTMLCanvasElement.prototype.toBlob = realToBlob;
  });

  it('no longer shows the verification link or its copy button', async () => {
    render(<CertificateDetailPage />);
    await screen.findByText('Score breakdown');
    expect(screen.queryByText('Verification')).not.toBeInTheDocument();
    expect(screen.queryByText(/onrender/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy link' })).not.toBeInTheDocument();
  });

  it('leaves chapter exams out of the breakdown and shows the mark out of 100', async () => {
    render(<CertificateDetailPage />);
    await screen.findByText('Score breakdown');
    expect(screen.queryByText('Chapter exams')).not.toBeInTheDocument();
    expect(screen.getByText('Lesson practice')).toBeInTheDocument();
    expect(screen.getByText('Chapter quizzes')).toBeInTheDocument();
    expect(screen.getAllByText('Final exam').length).toBeGreaterThan(0);
    // parts on the same 100 scale: 18 + 20.4 + 27.5 = 65.9, shown as the mark 66 / 100
    expect(screen.getByText('18 / 25 pts · 72%')).toBeInTheDocument();
    expect(screen.getByText('20.4 / 25 pts · 82%')).toBeInTheDocument();
    expect(screen.getByText('27.5 / 50 pts · 55%')).toBeInTheDocument();
    expect(screen.getByText('Your mark')).toBeInTheDocument();
    expect(screen.queryByText(/1000|1,000/)).not.toBeInTheDocument();
  });

  it('draws the certificate picture with the student and the mark', async () => {
    render(<CertificateDetailPage />);
    await waitFor(() => expect(recorded.texts).toContain('\u206666 / 100\u2069'));
    expect(recorded.texts).toEqual(expect.arrayContaining(['Yousef Ahmed', 'Starter']));
    expect(recorded.texts.join(' ')).not.toMatch(/onrender|verify/);
    expect(screen.getByRole('img', { name: 'Certificate of completion for Starter' })).toBeInTheDocument();
  });

  it('downloads the picture as a PNG named after the course', async () => {
    const created = jest.fn(() => 'blob:cert');
    const revoked = jest.fn();
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = created;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = revoked;
    let downloaded = '';
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloaded = this.download; });

    render(<CertificateDetailPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Download certificate (PNG)' }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(created).toHaveBeenCalledWith(expect.any(Blob));
    expect(downloaded).toBe('certificate-Starter.png');
    click.mockRestore();
  });

  it('says so if the picture could not be made', async () => {
    HTMLCanvasElement.prototype.toBlob = ((cb: (b: Blob | null) => void) => cb(null)) as never;
    render(<CertificateDetailPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Download certificate (PNG)' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not create the image');
  });
});
