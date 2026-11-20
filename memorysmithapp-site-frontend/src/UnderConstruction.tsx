/**
 * The one page of the website while it is built: what MemorySmith is, where
 * the product already answers, and the version this release serves.
 */

export interface UnderConstructionProps {
  /** The version `/config.json` names; null while it is read, or when it could not be. */
  readonly version: string | null;
}

export function UnderConstruction({ version }: UnderConstructionProps) {
  return (
    <main className="page">
      <picture className="symbol">
        <source srcSet="/symbol-dark.svg" media="(prefers-color-scheme: dark)" />
        <img src="/symbol.svg" alt="" width={160} height={115} />
      </picture>
      <p className="brand">MemorySmith</p>
      <h1>This website is under construction</h1>
      <p className="lead">
        MemorySmith keeps notebooks of Markdown notes that say how they want to be written. While
        this page is being built, the product is already at{' '}
        <a href="https://memorysmith.app">memorysmith.app</a>.
      </p>
      <footer className="version">{version ? `Version ${version}` : ' '}</footer>
    </main>
  );
}
