import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { UnderConstruction } from './UnderConstruction';

describe('the page under construction', () => {
  it('says it is under construction, and points at the product', () => {
    const html = renderToStaticMarkup(<UnderConstruction version="0.1.0" />);
    expect(html).toContain('This website is under construction');
    expect(html).toContain('href="https://memorysmith.app"');
  });

  it('shows the version it serves', () => {
    expect(renderToStaticMarkup(<UnderConstruction version="0.1.0" />)).toContain('Version 0.1.0');
  });

  it('shows no version while none is known', () => {
    expect(renderToStaticMarkup(<UnderConstruction version={null} />)).not.toContain('Version');
  });
});
