/**
 * Reading / exercise screens where the sidebar collapses to its icon rail and the column narrows:
 * a lesson (/lessons/:id) and a running practice session (/practice/:sessionId).
 * Topic lists (/practice/speaking, /practice/writing[/…]) and the lesson practice start page are not focus screens.
 */
export function isFocusPath(pathname: string): boolean {
  return /^\/(lessons\/[^/]+|practice\/(?!speaking$|writing(\/|$)|lesson\/)[^/]+)$/.test(pathname);
}
