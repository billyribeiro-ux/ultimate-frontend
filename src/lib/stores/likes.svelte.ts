/**
 * Optimistic-UI "likes" store used by Lesson 11.10. The pattern:
 *   1. flip the UI immediately (optimistic)
 *   2. call the (fake) server
 *   3. if the server rejects, roll back and surface an error
 */

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

	seed(id: string, initial: LikeState): void {
		if (!this.state[id]) this.state[id] = { ...initial };
	}

	async toggle(id: string, server: (liked: boolean) => Promise<boolean>): Promise<void> {
		const current = this.get(id);
		const next: LikeState = {
			liked: !current.liked,
			count: current.count + (current.liked ? -1 : 1)
		};

		// Optimistic write.
		this.state[id] = next;
		this.lastError = null;

		try {
			const ok = await server(next.liked);
			if (!ok) throw new Error('Server refused the update.');
		} catch (err) {
			// Roll back to the pre-toggle value.
			this.state[id] = current;
			this.lastError = err instanceof Error ? err.message : 'Unknown error';
		}
	}
}

export const likes = new LikesStore();
