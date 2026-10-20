export function createResultsTransition() {
  let generation = 0;
  let requested = false;

  return {
    cancel() {
      generation += 1;
      requested = false;
    },
    async run(show: () => unknown, complete: () => void) {
      if (requested) return;
      requested = true;
      const current = generation;
      try {
        await show();
      } catch {
        // An unavailable advertisement must never prevent viewing results.
      }
      if (current === generation) complete();
    },
  };
}
