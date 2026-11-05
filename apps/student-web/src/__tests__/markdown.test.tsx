import { render, screen } from '@testing-library/react';
import { Markdown } from '../components/common/Markdown';

describe('Markdown', () => {
  it('renders **bold** without raw asterisks', () => {
    const { container } = render(<Markdown text="This is **very important** text" />);
    expect(container.querySelector('strong')?.textContent).toBe('very important');
    expect(container.textContent).not.toContain('*');
  });

  it('renders lists, italics and code', () => {
    const { container } = render(<Markdown text={'Tips:\n- use *present* tense\n- try `have`\n\n1. one\n2. two'} />);
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
    expect(container.querySelector('em')?.textContent).toBe('present');
    expect(container.querySelector('code')?.textContent).toBe('have');
  });

  it('never injects HTML', () => {
    const { container } = render(<Markdown text={'<img src=x onerror=alert(1)> **ok**'} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('ok').tagName).toBe('STRONG');
  });

  it('leaves a lone asterisk alone', () => {
    const { container } = render(<Markdown text="5 * 3 = 15" />);
    expect(container.textContent).toBe('5 * 3 = 15');
  });
});
