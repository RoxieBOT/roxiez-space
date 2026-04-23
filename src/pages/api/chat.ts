import type { APIRoute } from 'astro';
// @ts-ignore — Vite raw import
import identity from '../../../IDENTITY.md?raw';
// @ts-ignore — Vite raw import
import soul from '../../../SOUL.md?raw';

export const prerender = false;

const SYSTEM_PROMPT = `${identity}

---

${soul}

---

请用中文回答。严格遵守上面的身份设定和说话风格。`;

const STREAM_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
};

const env = import.meta.env;

/**
 * Provider selection
 *   CHAT_PROVIDER=anthropic  (default) — 适配 Anthropic 原生 / 任何 Anthropic 兼容中转 (new-api / one-api)
 *   CHAT_PROVIDER=openai              — 适配 OpenAI 兼容 API (Kimi / DeepSeek / OpenAI / 通义 等)
 *
 *   共用的覆盖参数：CHAT_MODEL（显式指定模型，优先级最高）
 *
 *   Anthropic 参数：
 *     ANTHROPIC_API_KEY        (必填)
 *     ANTHROPIC_BASE_URL       (可选，默认 https://api.anthropic.com)
 *
 *   OpenAI 参数：
 *     OPENAI_API_KEY           (必填)
 *     OPENAI_BASE_URL          (必填，例如 Kimi: https://api.moonshot.cn/v1)
 *     OPENAI_MODEL             (可选，默认 moonshot-v1-8k)
 */
const PROVIDER = (env.CHAT_PROVIDER || 'anthropic').toLowerCase();

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let messages: any;
  try {
    ({ messages } = await request.json());
  } catch {
    return jsonError('请求体不是合法的 JSON', 400);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError('messages 不能为空', 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    if (PROVIDER === 'openai') {
      return await callOpenAI(messages, controller, timeout);
    }
    return await callAnthropic(messages, controller, timeout);
  } catch (e: any) {
    clearTimeout(timeout);
    if (e?.name === 'AbortError') return jsonError('上游请求超时', 504);
    return jsonError(`上游网络错误: ${e?.message || 'unknown'}`, 502);
  }
};

// ============================================================
// Anthropic — 原生协议（同时兼容 new-api / one-api 类网关）
// ============================================================
async function callAnthropic(
  messages: any[],
  controller: AbortController,
  timeout: ReturnType<typeof setTimeout>,
): Promise<Response> {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonError('ANTHROPIC_API_KEY 未配置', 500);

  const baseUrl = (env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, '');
  const model = env.CHAT_MODEL || 'claude-haiku-4-5-20251001';

  const upstream = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    const detail = await upstream.text().catch(() => '');
    return jsonError(detail || `上游返回 ${upstream.status}`, upstream.status || 502);
  }

  return passthroughStream(upstream.body, timeout, controller);
}

// ============================================================
// OpenAI 兼容协议 — 把流式响应转成 Anthropic 格式的 SSE
// 让前端 ChatWidget 无需改动即可兼容 Kimi / DeepSeek 等
// ============================================================
async function callOpenAI(
  messages: any[],
  controller: AbortController,
  timeout: ReturnType<typeof setTimeout>,
): Promise<Response> {
  const apiKey = env.OPENAI_API_KEY;
  const baseUrl = (env.OPENAI_BASE_URL || '').replace(/\/+$/, '');
  if (!apiKey) return jsonError('OPENAI_API_KEY 未配置', 500);
  if (!baseUrl) return jsonError('OPENAI_BASE_URL 未配置（例如 Kimi: https://api.moonshot.cn/v1）', 500);

  const model = env.CHAT_MODEL || env.OPENAI_MODEL || 'moonshot-v1-8k';

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    const detail = await upstream.text().catch(() => '');
    return jsonError(detail || `上游返回 ${upstream.status}`, upstream.status || 502);
  }

  return normalizeOpenAIStream(upstream.body, timeout, controller);
}

// ============================================================
// Stream helpers
// ============================================================
function passthroughStream(
  body: ReadableStream<Uint8Array>,
  timeout: ReturnType<typeof setTimeout>,
  controller: AbortController,
): Response {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const reader = body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writer.write(value);
      }
    } catch (e: any) {
      try {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: e?.message || 'stream error' })}\n\n`),
        );
      } catch {}
    } finally {
      clearTimeout(timeout);
      try { await writer.close(); } catch {}
    }
  })();

  return new Response(readable, { headers: STREAM_HEADERS });
}

function normalizeOpenAIStream(
  body: ReadableStream<Uint8Array>,
  timeout: ReturnType<typeof setTimeout>,
  controller: AbortController,
): Response {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const send = (obj: unknown) => writer.write(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

  (async () => {
    const reader = body.getReader();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const text: string | undefined = parsed?.choices?.[0]?.delta?.content;
            if (text) {
              await send({ type: 'content_block_delta', delta: { type: 'text_delta', text } });
            }
          } catch {
            /* 忽略单行解析错误 */
          }
        }
      }
      await writer.write(encoder.encode('data: [DONE]\n\n'));
    } catch (e: any) {
      try { await send({ type: 'error', error: e?.message || 'stream error' }); } catch {}
    } finally {
      clearTimeout(timeout);
      try { await writer.close(); } catch {}
    }
  })();

  return new Response(readable, { headers: STREAM_HEADERS });
}
