import { act } from 'react';
import { fireEvent, render, screen, waitFor } from '../test-utils';
import { ChapterForm } from '../../features/content/components/chapter-form';
import { LessonForm } from '../../features/content/components/lesson-form';
import type { AdminChapterSummary } from '../../features/content/api/admin-chapters-api';
import type { AdminLessonSummary } from '../../features/content/api/admin-lessons-api';

const chapter: AdminChapterSummary = {
  id: 'ch1',
  levelId: 'lv1',
  title: 'Talking About the Past',
  slug: 'past',
  description: 'Chapter intro',
  status: 'draft',
  sortOrder: 1,
  createdAt: '',
  updatedAt: '',
  availableLocales: ['en', 'ar'],
};

const lesson: AdminLessonSummary = {
  id: 'ls1',
  chapterId: 'ch1',
  title: 'Past Simple Basics',
  description: 'What it covers',
  status: 'draft',
  sortOrder: 1,
  systemPrompt: null,
  createdAt: '',
  updatedAt: '',
  availableLocales: ['en', 'ar'],
};

const arabic = (title: string, description: string | null) => ({
  data: { translations: [{ locale: 'ar', title, description }] },
});

describe('ChapterForm', () => {
  it('shows chapter-specific labels and keeps the slug outside the language tabs', () => {
    render(<ChapterForm mode="create" onSubmit={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByLabelText(/Chapter Title/)).toBeInTheDocument();
    expect(screen.getByLabelText('Chapter Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الفصل')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByLabelText('وصف الفصل')).toHaveAttribute('dir', 'rtl');
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
  });

  it('requires an English title and validates the slug', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    render(<ChapterForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'Bad Slug' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Chapter' }));
    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText(/Lowercase letters, numbers, and hyphens only/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('creates with an Arabic translation when entered, and none otherwise', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    render(<ChapterForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Chapter Title/), { target: { value: 'Greetings' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Chapter' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: 'Greetings', slug: null, description: null, translations: {} }),
    );

    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('عنوان الفصل'), { target: { value: 'التحيات' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Chapter' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0].translations).toEqual({ ar: { title: 'التحيات', description: null } });
  });

  it('loads saved Arabic, sends only changed translations and flags missing ones', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    const loadTranslations = jest.fn().mockResolvedValue(arabic('الماضي', 'مقدمة'));
    render(<ChapterForm mode="edit" initial={chapter} onSubmit={onSubmit} onCancel={jest.fn()} loadTranslations={loadTranslations} />);
    await waitFor(() => expect(loadTranslations).toHaveBeenCalledWith('ch1'));
    await waitFor(() => expect(screen.queryByText(/Loading translations/)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].translations).toEqual({});

    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الفصل')).toHaveValue('الماضي');
    fireEvent.change(screen.getByLabelText('عنوان الفصل'), { target: { value: 'الحديث عن الماضي' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0].translations).toEqual({
      ar: { title: 'الحديث عن الماضي', description: 'مقدمة' },
    });
  });

  it('shows Missing when there is no Arabic yet', async () => {
    const loadTranslations = jest.fn().mockResolvedValue({ data: { translations: [] } });
    render(<ChapterForm mode="edit" initial={chapter} onSubmit={jest.fn()} onCancel={jest.fn()} loadTranslations={loadTranslations} />);
    expect(await screen.findByRole('tab', { name: /العربية.*Missing/ })).toBeInTheDocument();
  });

  it('removes a saved translation only after confirmation', async () => {
    const onRemoveTranslation = jest.fn().mockResolvedValue({});
    const loadTranslations = jest.fn().mockResolvedValue(arabic('الماضي', null));
    render(
      <ChapterForm mode="edit" initial={chapter} onSubmit={jest.fn()} onCancel={jest.fn()} loadTranslations={loadTranslations} onRemoveTranslation={onRemoveTranslation} />,
    );
    await waitFor(() => expect(screen.queryByText(/Loading translations/)).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.click(screen.getByRole('button', { name: /Remove Arabic translation/ }));
    expect(onRemoveTranslation).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm remove' }));
    });
    expect(onRemoveTranslation).toHaveBeenCalledWith('ch1', 'ar');
  });

  it('shows the server action error after a partial failure', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ error: 'The chapter was saved, but some translations were not (ar: boom).' });
    render(<ChapterForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Chapter Title/), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Chapter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('some translations were not');
  });
});

describe('LessonForm', () => {
  it('requires the English description, shows the error under the description and marks it required', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    render(<LessonForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Lesson Title/), { target: { value: 'Greetings' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Lesson' }));
    expect(await screen.findByText('Description is required.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Lesson Description/)).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('uses lesson labels in English and Arabic', () => {
    render(<LessonForm mode="create" onSubmit={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الدرس')).toHaveAttribute('lang', 'ar');
    expect(screen.getByLabelText('وصف الدرس')).toHaveAttribute('dir', 'rtl');
  });

  it('allows an Arabic translation with a title only', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    render(<LessonForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Lesson Title/), { target: { value: 'Greetings' } });
    fireEvent.change(screen.getByLabelText(/Lesson Description/), { target: { value: 'Say hello' } });
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('عنوان الدرس'), { target: { value: 'التحيات' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Lesson' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Greetings',
        description: 'Say hello',
        translations: { ar: { title: 'التحيات', description: null } },
      }),
    );
  });

  it('rejects an Arabic description without an Arabic title and jumps to that tab', async () => {
    const onSubmit = jest.fn();
    render(<LessonForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Lesson Title/), { target: { value: 'Greetings' } });
    fireEvent.change(screen.getByLabelText(/Lesson Description/), { target: { value: 'Say hello' } });
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('وصف الدرس'), { target: { value: 'وصف فقط' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Lesson' }));
    expect(await screen.findByText(/Arabic title is required/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('edit mode loads Arabic, and does not resend it unchanged', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    const loadTranslations = jest.fn().mockResolvedValue(arabic('الماضي البسيط', 'ما يغطيه'));
    render(<LessonForm mode="edit" initial={lesson} onSubmit={onSubmit} onCancel={jest.fn()} loadTranslations={loadTranslations} />);
    await waitFor(() => expect(loadTranslations).toHaveBeenCalledWith('ls1'));
    await waitFor(() => expect(screen.queryByText(/Loading translations/)).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الدرس')).toHaveValue('الماضي البسيط');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ title: 'Past Simple Basics', description: 'What it covers', translations: {} });
  });

  it('blocks Arabic editing and sends no translations when loading failed', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    const loadTranslations = jest.fn().mockResolvedValue({ error: 'Backend error 500' });
    render(<LessonForm mode="edit" initial={lesson} onSubmit={onSubmit} onCancel={jest.fn()} loadTranslations={loadTranslations} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Backend error 500');
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الدرس')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].translations).toEqual({});
  });
});
