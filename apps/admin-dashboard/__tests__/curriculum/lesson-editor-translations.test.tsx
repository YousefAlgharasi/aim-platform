import { fireEvent, render, screen, waitFor } from '../test-utils';
import { LessonEditorForm } from '../../features/content/components/lesson-editor-form';
import type { AdminLessonSummary } from '../../features/content/api/admin-lessons-api';

const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, back: jest.fn() }),
}));

const lesson: AdminLessonSummary = {
  id: 'ls1',
  chapterId: 'ch1',
  title: 'Past Simple Basics',
  description: 'What it covers',
  status: 'draft',
  sortOrder: 3,
  systemPrompt: 'Focus on food.',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  availableLocales: ['en'],
};

async function renderEditor(onUpdate = jest.fn().mockResolvedValue({}), translations: unknown[] = []) {
  const loadTranslations = jest.fn().mockResolvedValue({ data: { translations } });
  render(<LessonEditorForm lesson={lesson} onUpdate={onUpdate} loadTranslations={loadTranslations} />);
  await waitFor(() => expect(loadTranslations).toHaveBeenCalledWith('ls1'));
  await waitFor(() => expect(screen.queryByText(/Loading translations/)).not.toBeInTheDocument());
  return { onUpdate, loadTranslations };
}

describe('LessonEditorForm translations', () => {
  it('shows English and Arabic tabs while sort order and AI instructions stay outside them', async () => {
    await renderEditor();
    expect(screen.getByRole('tab', { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /العربية.*Missing/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Lesson Title/)).toHaveValue('Past Simple Basics');
    expect(screen.getByLabelText('Sort Order')).toHaveValue(3);
    expect(screen.getByLabelText('AI Teacher instructions')).toHaveValue('Focus on food.');
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('Sort Order')).toBeInTheDocument();
    expect(screen.getByLabelText('AI Teacher instructions')).toBeInTheDocument();
  });

  it('saves English fields, sort order, AI instructions and only the changed Arabic translation', async () => {
    const { onUpdate } = await renderEditor();
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('عنوان الدرس'), { target: { value: 'الماضي البسيط' } });
    fireEvent.change(screen.getByLabelText('وصف الدرس'), { target: { value: 'ما يغطيه' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    expect(onUpdate).toHaveBeenCalledWith({
      title: 'Past Simple Basics',
      description: 'What it covers',
      sortOrder: 3,
      systemPrompt: 'Focus on food.',
      translations: { ar: { title: 'الماضي البسيط', description: 'ما يغطيه' } },
    });
  });

  it('loads an existing Arabic translation and does not resend it unchanged', async () => {
    const { onUpdate } = await renderEditor(undefined, [
      { locale: 'ar', title: 'الماضي البسيط', description: 'ما يغطيه' },
    ]);
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الدرس')).toHaveValue('الماضي البسيط');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    expect(onUpdate.mock.calls[0][0].translations).toEqual({});
  });

  it('keeps the English description required and the sort order numeric', async () => {
    const { onUpdate } = await renderEditor();
    fireEvent.change(screen.getByLabelText(/Lesson Description/), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText('Sort Order'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Description is required.')).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('shows the server error from a partial failure', async () => {
    const { onUpdate } = await renderEditor(
      jest.fn().mockResolvedValue({ error: 'The lesson was saved, but some translations were not (ar: boom).' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onUpdate).toHaveBeenCalled());
    expect(await screen.findByRole('alert')).toHaveTextContent('some translations were not');
  });
});
