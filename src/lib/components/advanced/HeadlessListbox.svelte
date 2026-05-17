<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ListboxOption {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface ListboxState {
		isOpen: boolean;
		selectedValue: string;
		highlightedIndex: number;
		options: ListboxOption[];
	}

	interface HeadlessListboxProps {
		options: ListboxOption[];
		value?: string;
		onchange?: (value: string) => void;
		children: Snippet<[ListboxState, { toggle: () => void; select: (value: string) => void; highlight: (index: number) => void }]>;
	}

	let { options, value = '', onchange, children }: HeadlessListboxProps = $props();

	let isOpen: boolean = $state(false);
	let selectedValue: string = $state(value);
	let highlightedIndex: number = $state(-1);

	function toggle(): void {
		isOpen = !isOpen;
		if (isOpen) {
			highlightedIndex = options.findIndex((o) => o.value === selectedValue);
		}
	}

	function select(val: string): void {
		const option = options.find((o) => o.value === val);
		if (option && !option.disabled) {
			selectedValue = val;
			isOpen = false;
			onchange?.(val);
		}
	}

	function highlight(index: number): void {
		if (index >= 0 && index < options.length) {
			highlightedIndex = index;
		}
	}

	let state: ListboxState = $derived({
		isOpen,
		selectedValue,
		highlightedIndex,
		options
	});

	let actions = { toggle, select, highlight };
</script>

{@render children(state, actions)}
