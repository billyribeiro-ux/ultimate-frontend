<!--
    Lesson 5.10 — Form accessibility and keyboard navigation.
    Mini-build: a labelled form with aria-describedby error messages,
    a custom keyboard-navigable listbox, and focus management on submit.
-->
<script lang="ts">
	const frameworks: readonly string[] = ['Svelte', 'React', 'Vue', 'Solid', 'Angular'] as const;

	let email: string = $state('');
	let password: string = $state('');
	let framework: string = $state('');

	let emailError: string = $state('');
	let passwordError: string = $state('');
	let frameworkError: string = $state('');

	let submitted: boolean = $state(false);

	// Custom listbox state.
	let listboxOpen: boolean = $state(false);
	let activeIndex: number = $state(0);
	let listboxButton: HTMLButtonElement | undefined = $state();

	function validateEmail(): void {
		if (email.trim() === '') {
			emailError = 'Email is required.';
		} else if (!/^\S+@\S+\.\S+$/.test(email)) {
			emailError = 'Please enter a valid email address.';
		} else {
			emailError = '';
		}
	}

	function validatePassword(): void {
		if (password.length < 8) {
			passwordError = 'Password must be at least 8 characters.';
		} else {
			passwordError = '';
		}
	}

	function validateFramework(): void {
		frameworkError = framework === '' ? 'Please choose a framework.' : '';
	}

	function onEmailInput(event: Event): void {
		email = (event.target as HTMLInputElement).value;
		if (emailError !== '') validateEmail();
	}

	function onPasswordInput(event: Event): void {
		password = (event.target as HTMLInputElement).value;
		if (passwordError !== '') validatePassword();
	}

	function onSubmit(event: SubmitEvent): void {
		event.preventDefault();
		validateEmail();
		validatePassword();
		validateFramework();

		if (emailError !== '' || passwordError !== '' || frameworkError !== '') {
			const form = event.currentTarget as HTMLFormElement;
			const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
			firstInvalid?.focus();
			return;
		}

		submitted = true;
	}

	function openListbox(): void {
		listboxOpen = true;
		activeIndex = Math.max(0, frameworks.indexOf(framework));
	}

	function closeListbox(): void {
		listboxOpen = false;
		listboxButton?.focus();
	}

	function onListboxKey(event: KeyboardEvent): void {
		if (!listboxOpen) {
			if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
				event.preventDefault();
				openListbox();
			}
			return;
		}
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				activeIndex = (activeIndex + 1) % frameworks.length;
				break;
			case 'ArrowUp':
				event.preventDefault();
				activeIndex = (activeIndex - 1 + frameworks.length) % frameworks.length;
				break;
			case 'Home':
				event.preventDefault();
				activeIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				activeIndex = frameworks.length - 1;
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				framework = frameworks[activeIndex];
				validateFramework();
				closeListbox();
				break;
			case 'Escape':
				event.preventDefault();
				closeListbox();
				break;
		}
	}

	function selectOption(option: string): void {
		framework = option;
		validateFramework();
		closeListbox();
	}
</script>

<svelte:head>
	<title>Lesson 5.10 · Form accessibility · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.10: an accessible form with aria-describedby errors and a keyboard-navigable custom select."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.10 · Mini-build</p>
		<h1>Accessible forms, keyboard first</h1>
	</header>

	{#if submitted}
		<div class="success" tabindex="-1" role="status">
			<h2>Submitted</h2>
			<p>Email: <code>{email}</code></p>
			<p>Framework: <code>{framework}</code></p>
		</div>
	{:else}
		<form class="form stack" onsubmit={onSubmit} novalidate>
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					autocomplete="email"
					value={email}
					oninput={onEmailInput}
					onblur={validateEmail}
					aria-invalid={emailError !== ''}
					aria-describedby="email-error"
				/>
				<p id="email-error" class="error" aria-live="polite">{emailError}</p>
			</div>

			<div class="field">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					autocomplete="new-password"
					value={password}
					oninput={onPasswordInput}
					onblur={validatePassword}
					aria-invalid={passwordError !== ''}
					aria-describedby="password-error"
				/>
				<p id="password-error" class="error" aria-live="polite">{passwordError}</p>
			</div>

			<div class="field">
				<label id="fw-label" for="fw-button">Favourite framework</label>
				<div class="listbox">
					<button
						type="button"
						id="fw-button"
						class="listbox__button"
						class:listbox__button--invalid={frameworkError !== ''}
						aria-haspopup="listbox"
						aria-expanded={listboxOpen}
						aria-labelledby="fw-label fw-button"
						aria-describedby="fw-error"
						onclick={() => (listboxOpen ? closeListbox() : openListbox())}
						onkeydown={onListboxKey}
						bind:this={listboxButton}
					>
						{framework || 'Choose...'}
					</button>
					{#if listboxOpen}
						<ul class="listbox__list" role="listbox" aria-labelledby="fw-label" tabindex="-1">
							{#each frameworks as option, i (option)}
								<li
									role="option"
									aria-selected={i === activeIndex}
									class="listbox__option"
									class:listbox__option--active={i === activeIndex}
									onclick={() => selectOption(option)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											selectOption(option);
										}
									}}
								>
									{option}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<p id="fw-error" class="error" aria-live="polite">{frameworkError}</p>
			</div>

			<button type="submit" class="btn btn--primary">Create account</button>
		</form>
	{/if}
</section>

<style>
	section {
		--color-brand: oklch(65% 0.18 260);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.form {
		max-inline-size: 28rem;
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 600;
	}

	.field input {
		min-block-size: 44px;
		padding-inline: var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.field input:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}

	.field input[aria-invalid='true'] {
		border-color: var(--color-error);
	}

	.error {
		margin: 0;
		min-block-size: 1.25em;
		font-size: var(--text-sm);
		color: var(--color-error);
	}

	.listbox {
		position: relative;
	}

	.listbox__button {
		inline-size: 100%;
		min-block-size: 44px;
		padding-inline: var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text);
		text-align: start;
	}

	.listbox__button:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}

	.listbox__button--invalid {
		border-color: var(--color-error);
	}

	.listbox__list {
		position: absolute;
		inset-inline-start: 0;
		inset-inline-end: 0;
		inset-block-start: calc(100% + var(--space-xs));
		margin: 0;
		padding: var(--space-xs);
		list-style: none;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 20;
	}

	.listbox__option {
		padding: var(--space-sm);
		border-radius: var(--radius-sm);
		cursor: pointer;
		min-block-size: 44px;
	}

	.listbox__option--active,
	.listbox__option[aria-selected='true'] {
		background: var(--color-brand);
		color: oklch(98% 0.01 260);
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.btn--primary {
		background: var(--color-brand);
		color: oklch(98% 0.01 260);
	}

	.success {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-lg);

		& h2 {
			color: var(--color-success);
			margin-block-end: var(--space-sm);
		}
	}

	.success:focus-visible {
		outline: 2px solid var(--color-brand);
		outline-offset: 2px;
	}
</style>
