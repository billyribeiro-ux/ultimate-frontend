---
chunk: query-batch-pattern
level: 1
penalty: 0
---

# query.batch() Pattern — Level 1 Hint (free)

Three separate queries is three separate HTTP requests. Three HTTP requests is three round trips. Three round trips is a dashboard that is visibly slower than it needs to be on a laggy mobile connection.

`query.batch()` collapses N queries into one request by collecting them during a single synchronous pass and flushing them together. The server unpacks the batch, runs each query, and returns one response containing all results. Each query still has its own typed return — you did not lose any safety.

Two questions to ask before you type:

1. **Are all three queries independent?** (No one depends on the output of another.) If so, they are safe to batch.
2. **Do they all live in the same tick of the event loop?** (They are declared in the same component, or in the same `load`.) That is how the batcher collects them.

Do not try to batch a query that depends on the result of another one — that is sequential by nature and batching will not help.
