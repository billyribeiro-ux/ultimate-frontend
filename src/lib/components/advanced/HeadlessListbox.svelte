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
	// Uncontrolled: starts from the `value` prop, then the component owns the
	// selection once the user picks something. Reading `value` inside the
	// $derived keeps it reactive to prop changes before the first selection.
	let selectedOverride: string | undefined = $state(undefined);
	const selectedValue: string = $derived(selectedOverride ?? value);
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
			selectedOverride = val;
			isOpen = false;
			onchange?.(val);
		}
	}

	function highlight(index: number): void {
		if (index >= 0 && index < options.length) {
			highlightedIndex = index;
		}
	}

	let listboxState: ListboxState = $derived({
		isOpen,
		selectedValue,
		highlightedIndex,
		options
	});

	let actions = { toggle, select, highlight };
</script>

{@render children(listboxState, actions)}
