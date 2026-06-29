# Optional OpenAI-Compatible Provider

FollowBrief's intended demo path uses the deterministic `mock` provider. It runs the Acme flow without API keys, hosted models, or local model downloads.

`AI_PROVIDER=openai-compatible` is available for manual experiments against a local or hosted `/v1/chat/completions` server. Model outputs may not match the deterministic Acme demo and may require prompt, schema, or provider-code changes.

## What Changes

Setting `AI_PROVIDER=openai-compatible` changes where FollowBrief gets workflow plans, summaries, and email draft content. The rest of the system still behaves the same:

- The API validates provider output with Zod schemas.
- Invalid workflow plans get one repair attempt before failing.
- The worker still executes the registered tools.
- `risk-policy.ts` still owns approval requirements.
- Customer-facing email drafts still pause for review.
- PostgreSQL remains the durable source of workflow state and events.

## Provider Env

Use these values for manual provider tests:

```env
AI_PROVIDER=openai-compatible
AI_BASE_URL=http://localhost:8080/v1
AI_MODEL=local-followup-model
AI_API_KEY=local
```

The provider calls `/v1/chat/completions` with JSON-oriented prompts. The model must return JSON that matches FollowBrief's schemas.

## Example Server Shapes

Example shape for a local `llama.cpp` server if you choose to test one:

```bash
llama-server \
  -m ./models/qwen3-4b-instruct-q4_k_m.gguf \
  --host 127.0.0.1 \
  --port 8080
```

Then run FollowBrief with:

```bash
AI_PROVIDER=openai-compatible \
AI_BASE_URL=http://localhost:8080/v1 \
AI_MODEL=local-followup-model \
AI_API_KEY=local \
pnpm dev
```

Example shape for a `vLLM` server if you choose to test one:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen3-8B \
  --host 127.0.0.1 \
  --port 8080
```

Then use the same FollowBrief env:

```env
AI_PROVIDER=openai-compatible
AI_BASE_URL=http://localhost:8080/v1
AI_MODEL=Qwen/Qwen3-8B
AI_API_KEY=local
```

## Notes

- Keep `AI_PROVIDER=mock` for the intended deterministic demo path, CI, and deployed demos.
- Use `AI_PROVIDER=openai-compatible` for manual tests with an OpenAI-compatible model server.
- If a model returns invalid JSON, FollowBrief attempts one repair and then fails the run with an inspectable tool/schema error.
