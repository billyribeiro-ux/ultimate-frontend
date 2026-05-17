/**
 * A generic state machine helper using Svelte 5 runes.
 * Models complex UI flows as explicit state transitions.
 */

type MachineConfig<TState extends string, TEvent extends string> = {
	initial: TState;
	states: Record<TState, {
		on?: Partial<Record<TEvent, TState>>;
	}>;
};

interface MachineInstance<TState extends string, TEvent extends string> {
	readonly current: TState;
	send: (event: TEvent) => void;
	matches: (state: TState) => boolean;
	canSend: (event: TEvent) => boolean;
}

export function createMachine<TState extends string, TEvent extends string>(
	config: MachineConfig<TState, TEvent>
): MachineInstance<TState, TEvent> {
	let current: TState = $state(config.initial);

	function send(event: TEvent): void {
		const stateConfig = config.states[current];
		const nextState = stateConfig.on?.[event];
		if (nextState) {
			current = nextState;
		}
	}

	function matches(state: TState): boolean {
		return current === state;
	}

	function canSend(event: TEvent): boolean {
		const stateConfig = config.states[current];
		return stateConfig.on?.[event] !== undefined;
	}

	return {
		get current() { return current; },
		send,
		matches,
		canSend
	};
}
