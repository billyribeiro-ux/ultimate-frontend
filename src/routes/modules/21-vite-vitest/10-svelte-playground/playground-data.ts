// Demo data + parsing helpers for the Lesson 21.10 mini-REPL.
//
// These live in a separate module on purpose: the default source code and the
// CSS-extraction regex both contain literal "<style>" / "<script>" substrings.
// Keeping them out of the +page.svelte file prevents the Svelte/`svelte-check`
// parser from mistaking those string literals for real markup tags.

const OPEN_SCRIPT = '<' + 'script lang="ts">';
const CLOSE_SCRIPT = '</' + 'script>';
const OPEN_STYLE = '<' + 'style>';
const CLOSE_STYLE = '</' + 'style>';

/** The starter component shown in the REPL editor on first load. */
export const DEFAULT_SOURCE = `${OPEN_SCRIPT}
  let count: number = $state(0);

  function increment(): void {
    count += 1;
  }
${CLOSE_SCRIPT}

<button onclick={increment}>
  Clicks: {count}
</button>

${OPEN_STYLE}
  button {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    border-radius: 0.5rem;
    border: 2px solid currentColor;
  }
${CLOSE_STYLE}`;

/** Pull the raw CSS out of a `<style>` block in source text, if present. */
export function extractStyleBlock(source: string): string | null {
	// Built dynamically so the literal tag never appears in a `.svelte` file.
	const styleRe = new RegExp(`${OPEN_STYLE}([\\s\\S]*?)${CLOSE_STYLE}`);
	const match = source.match(styleRe);
	return match ? match[1] : null;
}
