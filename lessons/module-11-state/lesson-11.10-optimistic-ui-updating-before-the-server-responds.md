---
module: 11
lesson: 11.10
title: Optimistic UI — updating before the server responds
duration: 50 minutes
prerequisites:
  - Lesson 11.5 — reactive classes with runes
  - Module 9B — remote functions (or Module 10 — form actions)
learning_objectives:
  - Explain the optimistic-UI pattern and the three moments it involves
  - Apply a local mutation before the server responds
  - Roll back the mutation cleanly if the server rejects the change
  - Surface the failure to the user with a live region for accessibility
  - Recognise the two classes of operations where optimism is inappropriate
status: ready
---

# Lesson 11.10 — Optimistic UI — updating before the server responds

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This is the last lesson of Module 11. It closes the loop between a reactive client (everything you have built so far) and a slow network (everything Module 9 set up).

## 1. Concept — Lying to the user, honestly

### 1.1 The perception problem

A user clicks a heart icon to like a post. The click is fast; the network is not. Even the best server on the best connection takes 50 to 200 milliseconds to acknowledge a request. Humans perceive anything over 100 ms as "slow" and anything over 300 ms as "broken". If the heart only fills in after the server responds, every like feels sluggish, and users doubt whether their click registered.

The fix is **optimistic UI**: flip the heart immediately, assume the server will succeed, and *roll back* only if it does not. The user sees instant feedback because the client does not wait. The pattern has three moments:

1. **Optimistic apply.** The local state mutates as if the server had already responded.
2. **Real call.** The actual request goes out in parallel.
3. **Reconcile.** On success, nothing to do — the optimistic value already matches. On failure, roll back to the pre-click value and surface an error.

The pattern is easy to write wrong. The two common mistakes are not storing the rollback value, and not surfacing the failure clearly enough for the user to notice. Both are solved by a small reactive class.

### 1.2 A typed optimistic store

```ts
// src/lib/stores/likes.svelte.ts
export interface LikeState {
	liked: boolean;
	count: number;
}

class LikesStore {
	private state = $state<Record<string, LikeState>>({});
	lastError = $state<string | null>(null);

	get(id: string): LikeState {
		return this.state[id] ?? { liked: false, count: 0 };
	}

	async toggle(id: string, server: (liked: boolean) => Promise<boolean>): Promise<void> {
		const current = this.get(id);
		const next: LikeState = {
			liked: !current.liked,
			count: current.count + (current.liked ? -1 : 1)
		};

		this.state[id] = next;        // 1. Optimistic apply
		this.lastError = null;

		try {
			const ok = await server(next.liked);   // 2. Real call
			if (!ok) throw new Error('Server refused the update.');
		} catch (err) {
			this.state[id] = current;            // 3. Rollback
			this.lastError = err instanceof Error ? err.message : 'Unknown error';
		}
	}
}

export const likes = new LikesStore();
```

Three things to notice:

1. **`current` is captured before the mutation.** Without that snapshot, there is nothing to roll back to. The snapshot is a plain object, not a reactive reference, because its job is to remember the past.
2. **The `server` function is a parameter.** The store does not know whether you call a remote function, a form action, or a raw `fetch`. In the test you pass a fake. In production you pass the real call.
3. **Errors go to a reactive `lastError` field.** Any component can read it and render an alert, a toast, or an inline message. Because it is `$state`, all readers update together.

### 1.3 Surfacing the failure — an ARIA live region

A rollback is useless if the user does not notice it. The heart goes from red back to grey, and the user assumes their second click succeeded. To fix this, render any error into an ARIA live region so screen readers announce it and visual users see it:

```svelte
<div class="toast" role="status" aria-live="polite">
	{#if likes.lastError}
		<p>{likes.lastError}</p>
	{/if}
</div>
```

`role="status"` and `aria-live="polite"` tell assistive tech to announce the content when it changes, without interrupting the current speech stream. Lesson 12.8 covers live regions in depth.

### 1.4 When optimism is *wrong*

Optimistic UI is not appropriate for every mutation. Two classes of operations should wait for the server:

1. **Operations whose outcome is not predictable from the client.** Payment. Inventory deduction. "Claim this coupon". The client does not know whether the server will succeed, so it cannot optimistically assume success. Render a spinner and wait.
2. **Operations that trigger expensive follow-ups.** Sending an email. Publishing a post. Anything where a rollback would feel worse than the wait. If the post briefly appears on the timeline and then vanishes, users will be more confused than if it simply took two seconds to appear in the first place.

A good rule: **optimism is right when the client can confidently predict the outcome and the rollback is cheap.** A like, a favourite, a toggle, a reorder — yes. A checkout, a send, a publish — no.

### 1.5 Combining with TanStack Table

If the row you are optimistically updating lives inside a TanStack Table, the reactive store does the right thing automatically: the store's mutation triggers a re-read of its state, which re-reads the table's data getter, which re-runs the row models. No manual `table.refresh()` call. This is why the store pattern from Lesson 11.5 composes cleanly with the table pattern from Lessons 11.7–11.9.

### 1.6 Pairing with remote functions

SvelteKit's April 2026 remote functions (Module 9B) make the server call half of this pattern particularly clean. A `command` remote function returns a typed promise; your store awaits it; the error handling is already standardised. The mini-build fakes the server call with `setTimeout` so the lesson runs without a backend, but the shape of the code is identical to what you would write against a real remote command.

### 1.7 Optimistic UI and lists: the position problem

When applying optimistic UI to list operations (add, remove, reorder), a subtle problem emerges: the item you optimistically added might appear at a different position than where the server ultimately places it (e.g., if the server sorts by creation timestamp). After reconciliation, the list "jumps" — the item that appeared at position 3 optimistically ends up at position 7 after the server responds. For most applications, this is acceptable because the jump happens quickly (50-200ms). For highly visible lists (chat messages, social feeds), consider inserting optimistically at the correct predicted position based on your knowledge of the server's sort order.

### 1.8 Combining optimistic UI with form actions

Optimistic UI also works with classic form actions when using `use:enhance`. The enhance callback gives you control over what happens before and after the server responds:

```svelte
<form method="POST" use:enhance={() => {
    // Optimistic apply: update UI immediately
    likes.optimisticToggle(id);
    
    return async ({ result, update }) => {
        if (result.type === 'failure') {
            likes.rollback(id);
        }
        await update();
    };
}}>
```

This pattern integrates with SvelteKit's form action lifecycle while still giving instant feedback.

### 1.x What happens under the hood — the optimistic update timeline

Here is the precise sequence for an optimistic delete in a SvelteKit app:

```
t=0ms    User clicks "Delete" on item #42
t=0ms    Optimistic handler runs:
         - Read current state: [#40, #41, #42, #43]
         - Compute optimistic state: [#40, #41, #43]
         - Write optimistic state to local reactive store
t=1ms    Svelte re-renders: item #42 disappears from the list
t=1ms    Network request starts: POST /delete { id: 42 }
t=200ms  Server validates, deletes from database, responds { ok: true }
t=200ms  Confirmation handler runs:
         - Server agreed: no rollback needed
         - Optionally refresh the query for authoritative data
t=200ms  Done — user saw instant feedback at t=1ms
```

**Rollback scenario (server rejects):**

```
t=0ms    User clicks "Delete" on item #42
t=0ms    Optimistic state: [#40, #41, #43] (item #42 removed)
t=1ms    Svelte re-renders: item #42 gone
t=200ms  Server responds: { ok: false, error: "Permission denied" }
t=200ms  Rollback handler runs:
         - Restore previous state: [#40, #41, #42, #43]
t=201ms  Svelte re-renders: item #42 reappears
t=201ms  Error toast: "Could not delete: permission denied"
```

### 1.x Comparison: optimistic UI strategies

| Strategy | User sees delay? | Rollback complexity | Best for |
| --- | --- | --- | --- |
| No optimism (wait for server) | Yes (full round trip) | None | Destructive actions, payments |
| Optimistic with rollback | No | Medium (restore old state) | Toggles, deletes, moves |
| Optimistic without rollback | No | None (assume success) | Low-stakes actions, likes |
| Optimistic with retry | No | High (queue + retry logic) | Offline-first apps |

### 1.x Common interview question

**Q: "What is optimistic UI, and when should you NOT use it?"**

**Model answer:** Optimistic UI updates the local view immediately when the user triggers a mutation, before waiting for the server's response. The UI predicts the outcome and shows it instantly. If the server confirms, nothing changes. If the server rejects, the UI rolls back to the previous state. You should NOT use optimistic UI for: (1) destructive actions that cannot be undone — deleting an account, processing a payment — where a false positive is worse than a brief delay; (2) actions with complex server-side validation where rejection is common — the frequent rollbacks confuse users; (3) actions where the server produces data the client cannot predict — generating an ID, computing a total with server-side discounts. In these cases, show a loading state and wait for the server.

## Deep Dive

**Why this matters at scale.** In a production app with real users on real networks, every mutation without optimistic UI creates a perceptible delay. Users on 4G connections (200-500ms latency) experience a half-second gap between clicking and seeing feedback. Multiply by 20 interactions per session and you have 10 seconds of cumulative "dead time" where the app feels unresponsive. Optimistic UI eliminates this entirely for predictable operations. The difference in perceived quality between an optimistic app and a non-optimistic app is immediately obvious to users — they describe the optimistic app as "snappy" and the non-optimistic one as "laggy," even though both complete the same operations in the same real time.

**The mental model.** Optimistic UI is like writing a check. When you write a check (optimistic apply), you immediately deduct the amount from your mental ledger — you consider that money spent. The bank (server) processes the check later. If the check clears (success), your mental ledger already matches the bank's ledger — nothing to reconcile. If the check bounces (failure), you have to add the money back to your mental ledger (rollback) and deal with the consequences (error message). The key insight: you update your mental model immediately because you *expect* the check to clear. You only correct if it does not.

**Edge cases.** Race conditions: if the user clicks "like" twice quickly, the first optimistic toggle sets `liked: true`, the first server call goes out, the second optimistic toggle sets `liked: false`, the second server call goes out. If the first server call fails and rolls back, it restores to `liked: false` — which accidentally matches the user's current intent. But if the second call also fails, the rollback restores to `liked: true` — which was the state before the second click, but not the current intent. The fix: each toggle must capture its own snapshot independently and rollbacks must be ordered. The store pattern in this lesson handles this correctly because each `toggle()` captures `current` before mutating.

**Performance implications.** Optimistic UI has zero network performance impact — the server call fires at the same time regardless. The benefit is purely perceptual: the user sees the result 100-500ms sooner. The CPU cost is one extra state write (the optimistic apply) and potentially one rollback write (on failure). Both are negligible. The only real cost is code complexity: you must capture snapshots, handle rollbacks, surface errors, and reason about partially-applied state. This complexity is worth it for high-frequency interactions (likes, toggles, reorders) but overkill for rare operations (account deletion, checkout).

**Connection to other modules.** Optimistic UI builds on Module 2 (reactive state for the local mutation), Module 9B (remote commands for the server call), Module 11 Lesson 11.5 (reactive classes for the store pattern), and Module 12 Lesson 12.8 (ARIA live regions for accessible error surfacing). The capstone project uses optimistic UI for its interactive features �� likes, favorites, and reordering — demonstrating the pattern at production scale with real network latency and real error scenarios.


## Going Deeper

- **Svelte docs:** Check the relevant section in the [Svelte documentation](https://svelte.dev/docs).
- **Challenge:** Apply the pattern from this lesson to a real component in your own project. Measure the before and after in terms of code lines and type safety.

## 2. Style it — A heart that flips instantly

The mini-build renders a short list of posts, each with a heart button and a count. Per-page accent: `oklch(65% 0.22 15)` (crimson).

- Heart button is 44px square, centred, with a `transition: transform var(--dur-fast) var(--ease-expressive)` that scales the icon on click.
- Under `prefers-reduced-motion`, the scale transition is replaced with a zero-duration opacity change.
- The failure toast is a `.toast` element with `role="status"` and a soft left border in `var(--color-error)`.

## 3. Interact — Three server simulations

The mini-build lets students toggle three modes via a select at the top: *always succeed*, *random 30% failure*, *always fail*. Each mode uses a fake `server(liked: boolean)` that returns a promise after 300 ms. Students watch the optimistic apply, then either see the state settle or see the rollback.

## 4. Mini-build — An optimistic like button with rollback

**File:** `src/routes/modules/11-state/10-optimistic-ui/+page.svelte`

Imports the `likes` store from `src/lib/stores/likes.svelte.ts` (already written for you). Renders three posts, each calling `likes.toggle(id, fakeServer)` on click. A mode selector sets the fake server's behaviour. A toast renders `likes.lastError` via a live region.

### DevTools moment

Open the Network tab. Set the throttle to "Slow 3G". Click the heart. Watch the icon fill *immediately* in the UI while the network request takes a full second to complete. That gap is the user experience win. Now switch the mode to "always fail" and click again — the icon fills, the server takes a second, and then the icon rolls back. The toast shows the error message. This is optimistic UI doing its whole job.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the three moments of an optimistic mutation?</summary>

Optimistic apply (mutate the local state immediately), real call (fire the request in parallel), and reconcile (do nothing on success, roll back on failure).
</details>

<details>
<summary><strong>Q2.</strong> Why capture <code>current</code> before applying the optimistic update?</summary>

Because the only way to roll back cleanly is to remember the pre-mutation value. Without the snapshot, a failure leaves you with no idea what to restore. The snapshot must be captured *before* the mutation, not derived from the mutated state.
</details>

<details>
<summary><strong>Q3.</strong> Why render the error in an ARIA live region?</summary>

A silent rollback is invisible to users who are not watching the exact pixel that changed. A live region announces the error to screen readers and puts a visual message on the page so any user notices the failure. Without it, users assume their action succeeded and lose trust when they later discover it did not.
</details>

<details>
<summary><strong>Q4.</strong> Name two operations where optimistic UI is inappropriate.</summary>

Any operation whose outcome the client cannot confidently predict (payment, inventory claim, coupon redemption) and any operation whose rollback would confuse users more than the wait would (publishing a post, sending an email). Use a spinner and wait for those.
</details>

<details>
<summary><strong>Q5.</strong> How does the optimistic store interact with a TanStack Table listing the same rows?</summary>

The store mutation triggers reactive reads across the app. The table's `get data()` getter re-runs, the row models re-derive, and the table re-renders the affected row automatically. There is no manual refresh step — that is why the store pattern composes with the table pattern.
</details>

## 6. Common mistakes

- **Forgetting to capture the pre-mutation value.** No rollback possible.
- **Swallowing the error.** The rollback happens silently. Always expose a `lastError` (or equivalent) and surface it visually.
- **Using optimism for operations the client cannot predict.** Payments, inventory claims, anything with server-side side effects that cannot be reversed. Wait for those.
- **Rolling back only the changed field.** If your mutation touched two fields, roll both back. The snapshot is the contract.

## 7. What's next

This is the last lesson of Module 11. The module project brings every technique together into an admin dashboard. Then Module 12 takes the finished app and makes it fast, tested, accessible, and deployable.
