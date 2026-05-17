# Module 17 — Real-Time Communication — Module Project

## Live Collaboration Board

Build a real-time collaboration board where multiple users can see each other's cursor positions (WebSocket) and receive a notification feed of board events (SSE). The project ties together every concept from this module into a single cohesive application.

### Requirements

1. **Cursor sharing (WebSocket):** Each connected user's cursor position is broadcast to all other connected users in real time. Cursors are labeled with usernames and color-coded.
2. **Notification feed (SSE):** Board events (user joined, user left, cursor idle timeout) stream to all clients via Server-Sent Events. Notifications appear as dismissable toasts.
3. **Typed messages:** All WebSocket messages use the discriminated union types from `$lib/realtime/types.ts`. All payloads are validated at runtime with Valibot before processing.
4. **Auto-reconnect:** Both the WebSocket and SSE connections implement exponential backoff reconnection. The UI shows a connection status indicator.
5. **Presence indicators:** A sidebar shows all currently connected users with colored dots. When a user disconnects, they fade out with a Svelte transition.
6. **PE7 styling:** OKLCH color tokens, mobile-first layout, 44px touch targets, per-page color personality, `prefers-reduced-motion` respected on all animations.
7. **BroadcastChannel:** If the user opens multiple tabs, only one tab holds the WebSocket connection. Other tabs receive updates via BroadcastChannel.

### Architecture

```
src/routes/modules/17-realtime/project/
  +page.svelte          — Main board UI (canvas area + sidebar + toast container)
  +page.server.ts       — Load function returning initial board state
  api/
    events/+server.ts   — SSE endpoint for board notifications
```

The WebSocket server runs as a custom Vite plugin in development and a standalone process in production (adapter-node). The board state is held in-memory for the project scope.

### Stretch goals

- Persist cursor trails as SVG paths on the board
- Add a "draw mode" where cursor movement leaves visible marks
- Rate-limit cursor updates to 30fps using requestAnimationFrame throttling
- Add sound effects for join/leave events (respecting prefers-reduced-motion as a proxy for reduced stimuli preference)

### Grading rubric

| Criterion | Weight |
| --- | --- |
| Typed messages with discriminated unions | 20% |
| Working SSE notification feed | 20% |
| Working WebSocket cursor sharing | 20% |
| Reconnection with exponential backoff | 15% |
| PE7 styling compliance | 15% |
| BroadcastChannel multi-tab support | 10% |
