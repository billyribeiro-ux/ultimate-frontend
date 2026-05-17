---
module: 17
lesson: 17.7
title: Building a live chat
duration: 55 minutes
prerequisites:
  - Lesson 17.6 — WebSocket in SvelteKit
  - Lesson 17.5 — typed message protocol
  - Module 2 — $state and $effect
learning_objectives:
  - Build a complete chat UI with message list, input, and user presence indicator
  - Implement optimistic send so the user sees their message before server confirmation
  - Auto-scroll the message list to the latest message using $effect and scrollIntoView
  - Track and display user presence (online users) from server broadcast messages
  - Handle edge cases — empty messages, rapid sends, disconnection during send
status: ready
---

# Lesson 17.7 — Building a live chat

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson combines everything from lessons 17.5 and 17.6 into a practical application: a real-time chat with presence. The mini-build uses a simulated connection (no real server) but implements every UI pattern you need for a production chat.

## 1. Concept — From protocol to product

### 1.1 What the problem is

You understand WebSocket, typed messages, and SvelteKit integration. But a working chat is more than a WebSocket connection — it is a complete user experience with dozens of small details that determine whether the chat feels instant, reliable, and pleasant. This lesson focuses on the client-side patterns that make a chat feel professional.

### 1.2 Message state management

A chat needs a reactive array of messages. Each message has metadata: who sent it, when, and whether it has been confirmed by the server.

```typescript
interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    text: string;
    timestamp: string;
    status: 'sending' | 'sent' | 'failed';
}

let messages: ChatMessage[] = $state([]);
```

The `status` field enables optimistic UI — the message appears in the list immediately with status `'sending'`, then updates to `'sent'` when the server confirms, or `'failed'` if the connection drops. This gives the user instant feedback while maintaining accuracy.

### 1.3 Optimistic send

The user types a message and presses Enter. Two things happen simultaneously:

1. **Optimistic:** The message is added to the local `messages` array with status `'sending'`. The user sees it immediately.
2. **Network:** The message is sent over the WebSocket. When the server broadcasts it back (to other clients), it includes a server-assigned ID and timestamp.

The client does NOT add the broadcast version to its own list (that would create a duplicate). Instead, it updates the existing optimistic message's status to `'sent'` and stores the server-assigned ID for future reference.

```typescript
function sendMessage(text: string): void {
    const optimisticId = crypto.randomUUID();
    const msg: ChatMessage = {
        id: optimisticId,
        userId: currentUserId,
        username: currentUsername,
        text,
        timestamp: new Date().toISOString(),
        status: 'sending'
    };
    messages = [...messages, msg];
    
    socket.send(JSON.stringify({
        type: 'chat:send',
        payload: { text, clientId: optimisticId }
    }));
}
```

When the server confirms:

```typescript
// Server sends back a confirmation with the optimistic ID
case 'chat:confirmed':
    messages = messages.map(m =>
        m.id === msg.payload.clientId ? { ...m, status: 'sent' } : m
    );
    break;
```

### 1.4 Auto-scroll with $effect

When a new message arrives, the message list should scroll to the bottom — but only if the user is already at the bottom. If the user has scrolled up to read history, a new message should NOT yank them down. This is one of the most common UX bugs in chat applications.

```typescript
let messageListEl: HTMLElement;
let shouldAutoScroll: boolean = $state(true);

function handleScroll(): void {
    const { scrollTop, scrollHeight, clientHeight } = messageListEl;
    shouldAutoScroll = scrollHeight - scrollTop - clientHeight < 50;
}

$effect(() => {
    // This runs every time messages changes
    const _ = messages.length; // track dependency
    if (shouldAutoScroll && messageListEl) {
        messageListEl.scrollTop = messageListEl.scrollHeight;
    }
});
```

The `messages.length` read establishes a dependency — every time a message is added, the effect re-runs and scrolls if appropriate.

### 1.5 User presence

A presence indicator shows who is currently online. The server broadcasts `presence:joined` and `presence:left` events. The client maintains a reactive list:

```typescript
interface OnlineUser {
    userId: string;
    username: string;
}

let onlineUsers: OnlineUser[] = $state([]);
```

When a `presence:list` message arrives (sent on connect), replace the entire list. When `presence:joined` arrives, add the user. When `presence:left` arrives, remove them. This gives you a live "who's online" sidebar.

### 1.6 Edge cases

Real chat applications must handle:

- **Empty messages:** Validate before send. Trim whitespace. Reject empty strings.
- **Rapid sends:** Users pressing Enter repeatedly. The WebSocket can handle it, but you might want rate limiting (disable the send button for 100ms after send).
- **Disconnection during send:** The optimistic message shows status `'sending'` forever. On disconnect, mark all `'sending'` messages as `'failed'` and show a retry button.
- **Very long messages:** Set a character limit. Display gracefully with `word-break: break-word`.
- **HTML injection:** Never render message text as raw HTML. Use textContent or Svelte's default escaping (which is automatic in `{expression}` syntax).

## 2. Style it — Chat layout with presence sidebar

The chat layout uses CSS Grid:

- On mobile: single column, presence collapsed into a header count
- From `--bp-md` up: two columns — messages (wider) and presence sidebar (narrow)
- Messages from "you" are right-aligned with brand-color background
- Messages from others are left-aligned with surface-2 background
- Each message bubble shows username, text, and timestamp
- The input area is sticky at the bottom with a 44px minimum height
- The presence sidebar lists users with colored dots (each user gets a unique hue from OKLCH)
- Page personality: `oklch(60% 0.18 280)` — protocol purple

## 3. Interact — Auto-scroll detection with scrollTop

The concept is **scroll position tracking** to conditionally auto-scroll.

The mistake:

```typescript
// BUG: always scrolls down, even when user is reading history
$effect(() => {
    messages.length; // dependency
    messageListEl.scrollTop = messageListEl.scrollHeight;
});
```

This is infuriating for users who are trying to read earlier messages while new ones arrive. The fix introduces a threshold check:

```typescript
function isNearBottom(el: HTMLElement): boolean {
    return el.scrollHeight - el.scrollTop - el.clientHeight < 50;
}
```

The 50px threshold means "within one message height of the bottom." If the user has scrolled up by even one full message, we assume they are reading history and leave them alone. When they scroll back to the bottom, auto-scroll resumes.

## 4. Mini-build — Simulated live chat with presence

**File:** `src/routes/modules/17-realtime/07-live-chat/+page.svelte`

This mini-build simulates a multi-user chat. Three bot users ("Alice", "Bob", "Charlie") send messages at random intervals. The student can type and send messages, which appear immediately (optimistic). A presence sidebar shows who is "online."

**Note:** No real WebSocket server is running. The simulation demonstrates every UI pattern: optimistic send, auto-scroll, presence tracking, and message status. Wire it to a real server by replacing the simulation with a `new WebSocket(...)` connection.

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/17-realtime/07-live-chat`.

You will see a chat interface with a message area and a presence sidebar (on wider screens). Bot messages appear every 2-5 seconds. Type a message and press Enter or click Send — it appears instantly on the right. Scroll up while messages arrive — the view stays in place until you scroll back down.

### DevTools moment

1. Open the **Elements** panel and watch the message list container's `scrollTop` property as messages arrive. When you are at the bottom, it increases. When you scroll up, it stays fixed.
2. Open the **Performance** tab and watch for layout thrashing. The auto-scroll only reads `scrollHeight`/`scrollTop` once per message arrival — no expensive read-write loops.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is "optimistic send" and why does it matter for chat UX?</summary>

Optimistic send means showing the user's message in the chat immediately when they press Send, before the server confirms delivery. This removes the perceived latency (typically 50-200ms round trip) and makes the chat feel instant. The message is marked with a "sending" status that updates to "sent" when confirmed. Without optimistic send, there is a visible delay between pressing Enter and seeing your message — this feels sluggish and makes users doubt whether their message was sent.
</details>

<details>
<summary><strong>Q2.</strong> Why should auto-scroll NOT activate when the user has scrolled up?</summary>

If the user has scrolled up, they are reading older messages. Forcing them to the bottom on every new arrival makes it impossible to read history in an active chat — the view keeps jumping. The correct behaviour is: auto-scroll only when the user is already at (or near) the bottom. When they are scrolled up, show a "new messages" indicator instead, and resume auto-scroll when they manually scroll back down.
</details>

<details>
<summary><strong>Q3.</strong> How do you prevent a sent message from appearing twice (once optimistic, once from server broadcast)?</summary>

Include a client-generated ID (like a UUID) in the send payload. When the server broadcasts the message to all clients, it includes this client ID. The sender checks incoming messages against their optimistic list — if the client ID matches an existing optimistic message, they update its status to "sent" rather than adding a duplicate. Other clients (who did not send it) do not have it in their list, so they add it normally.
</details>

<details>
<summary><strong>Q4.</strong> What happens to messages with status "sending" if the WebSocket connection drops?</summary>

They are stuck in "sending" status forever because no confirmation will arrive. On connection close/error, the client should iterate through all messages with status "sending" and mark them as "failed." The UI then shows a retry button or an error indicator on those messages, allowing the user to resend them once reconnected.
</details>

<details>
<summary><strong>Q5.</strong> Why is Svelte's default text escaping sufficient to prevent XSS in chat messages?</summary>

Svelte automatically escapes all expressions in `{curly braces}` — HTML special characters like `<`, `>`, `&`, `"` are converted to their entity equivalents. A malicious message like `<script>alert('xss')</script>` renders as literal text, not executable HTML. You would only be vulnerable if you used `{@html message.text}`, which bypasses escaping. Never use `@html` with user-generated content.
</details>

## 6. Common mistakes

- **Always auto-scrolling.** The single most complained-about UX bug in chat applications. Users cannot read history because new messages keep yanking the scroll position to the bottom. Always check if the user is already near the bottom before scrolling.
- **Not handling message send failure.** If the WebSocket drops mid-message, the optimistic message sits forever with a "sending" spinner. Detect connection loss and mark pending messages as "failed" with a visual indicator and retry option.
- **Rendering messages with `{@html}`.** Never render user-supplied text as raw HTML. This creates XSS vulnerabilities. Svelte's default `{expression}` escaping is your best friend — use it for all message content.
- **Growing the message array without bound.** A busy chat room can generate thousands of messages per hour. Keep a rolling window (e.g., last 200 messages) and implement "load more" for history. Without a cap, the DOM grows until the browser struggles to render and scroll performance degrades.

## 7. What's next

Lesson 17.8 covers scaling patterns — connection pooling, heartbeat/ping-pong, exponential backoff reconnection, BroadcastChannel for multi-tab support, and when to use managed services versus self-hosted WebSocket.
