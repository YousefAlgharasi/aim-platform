import { act } from 'react';
import { fireEvent, render, screen, waitFor } from '../test-utils';
import { CourseForm } from '../../features/content/components/course-form';
import type { AdminCourseSummary, CourseTranslationsData } from '../../features/content/api/admin-courses-api';

const course: AdminCourseSummary = {
  id: 'course-1',
  slug: 'english-101',
  title: 'English 101',
  description: 'Intro course',
  status: 'draft',
  sortOrder: 1,
  createdAt: '2026-01-15T12:00:00Z',
  updatedAt: '2026-01-15T12:00:00Z',
  availableLocales: ['en', 'ar'],
};

const withArabic: CourseTranslationsData = {
  courseId: 'course-1',
  supportedLocales: ['en', 'ar'],
  missingLocales: [],
  translations: [
    { locale: 'en', title: 'English 101', description: 'Intro course' },
    { locale: 'ar', title: 'الإنجليزية 101', description: 'دورة تمهيدية' },
  ],
};

const englishOnly: CourseTranslationsData = {
  ...withArabic,
  missingLocales: ['ar'],
  translations: [withArabic.translations[0]],
};

async function renderEdit(data: CourseTranslationsData, extra: Record<string, unknown> = {}) {
  const onSubmit = jest.fn().mockResolvedValue({});
  const loadTranslations = jest.fn().mockResolvedValue({ data });
  render(
    <CourseForm mode="edit" initial={course} onSubmit={onSubmit} onCancel={jest.fn()} loadTranslations={loadTranslations} {...extra} />,
  );
  await waitFor(() => expect(loadTranslations).toHaveBeenCalledWith('course-1'));
  await waitFor(() => expect(screen.queryByText(/Loading translations/)).not.toBeInTheDocument());
  return { onSubmit, loadTranslations };
}

describe('CourseForm multilingual', () => {
  it('create mode requires the English title and submits without translations when Arabic is empty', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    render(<CourseForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Course' }));
    expect(await screen.findByText('Title is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Course Title/), { target: { value: 'New Course' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Course' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: 'New Course', slug: null, description: null, translations: {} }),
    );
  });

  it('create mode sends the Arabic translation when entered', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    render(<CourseForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/Course Title/), { target: { value: 'New Course' } });
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('عنوان الدورة'), { target: { value: 'دورة جديدة' } });
    fireEvent.change(screen.getByLabelText('وصف الدورة'), { target: { value: 'وصف' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Course' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Course',
        slug: null,
        description: null,
        translations: { ar: { title: 'دورة جديدة', description: 'وصف' } },
      }),
    );
  });

  it('rejects an Arabic description without an Arabic title and jumps to the Arabic tab', async () => {
    const onSubmit = jest.fn();
    render(<CourseForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/Course Title/), { target: { value: 'New Course' } });
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('وصف الدورة'), { target: { value: 'وصف فقط' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Course' }));

    expect(await screen.findByText(/Arabic title is required/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('edit mode loads existing translations into the Arabic fields', async () => {
    await renderEdit(withArabic);
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الدورة')).toHaveValue('الإنجليزية 101');
    expect(screen.getByLabelText('وصف الدورة')).toHaveValue('دورة تمهيدية');
    expect(screen.queryByText('Missing')).not.toBeInTheDocument();
  });

  it('edit mode flags a missing Arabic translation', async () => {
    await renderEdit(englishOnly);
    expect(screen.getByRole('tab', { name: /العربية.*Missing/ })).toBeInTheDocument();
  });

  it('does not resubmit unchanged translations, and submits only the changed one', async () => {
    const { onSubmit } = await renderEdit(withArabic);

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].translations).toEqual({});

    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('عنوان الدورة'), { target: { value: 'عنوان معدل' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0].translations).toEqual({
      ar: { title: 'عنوان معدل', description: 'دورة تمهيدية' },
    });
  });

  it('blocks Arabic editing and never sends translations when they failed to load, but still allows English edits', async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    const loadTranslations = jest.fn().mockResolvedValue({ error: 'Backend error 500' });
    render(<CourseForm mode="edit" initial={course} onSubmit={onSubmit} onCancel={jest.fn()} loadTranslations={loadTranslations} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Backend error 500');
    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    expect(screen.getByLabelText('عنوان الدورة')).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].translations).toEqual({});
  });

  it('removes a saved translation only after confirmation', async () => {
    const onRemoveTranslation = jest.fn().mockResolvedValue({});
    await renderEdit(withArabic, { onRemoveTranslation });

    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.click(screen.getByRole('button', { name: /Remove Arabic translation/ }));
    expect(onRemoveTranslation).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm remove' }));
    });
    expect(onRemoveTranslation).toHaveBeenCalledWith('course-1', 'ar');
    await waitFor(() => expect(screen.getByLabelText('عنوان الدورة')).toHaveValue(''));
    expect(screen.getByRole('tab', { name: /العربية.*Missing/ })).toBeInTheDocument();
  });

  it('keeps the translation and shows the error when removal fails', async () => {
    const onRemoveTranslation = jest.fn().mockResolvedValue({ error: 'Backend error 500' });
    await renderEdit(withArabic, { onRemoveTranslation });

    fireEvent.click(screen.getByRole('tab', { name: /العربية/ }));
    fireEvent.click(screen.getByRole('button', { name: /Remove Arabic translation/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm remove' }));
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Backend error 500');
    expect(screen.getByLabelText('عنوان الدورة')).toHaveValue('الإنجليزية 101');
  });

  it('shows the submit error returned by the server action', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ error: 'The course was saved, but some translations were not (ar: boom).' });
    render(<CourseForm mode="create" onSubmit={onSubmit} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Course Title/), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Course' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('some translations were not');
  });
});
