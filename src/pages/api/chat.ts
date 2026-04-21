import type { APIRoute } from 'astro';

export const prerender = false;

const SYSTEM_PROMPT = `你是一个个人网站上的 AI 助手，是站长的"数字分身"。
你的名字叫 MySpace AI。你性格友好、简洁、有趣。
当被问到站长相关信息时，请根据以下信息回答：
- 你是一名开发者，热爱技术与创造
- 这个站点使用 Astro + Netlify 搭建
- 你可以在作品集页面查看站长的项目
- 你可以在博客页面查看站长的文章
如果被问到你不知道的事情，诚实地说你不确定。
请用中文回答，保持简洁。`;

const STREAM_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
};

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonError('API key not configured', 500);

  let messages: unknown;
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

  let upstream: Response;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
        stream: true,
      }),
    });
  } catch (e: any) {
    clearTimeout(timeout);
    if (e?.name === 'AbortError') return jsonError('上游请求超时', 504);
    return jsonError(`上游网络错误: ${e?.message || 'unknown'}`, 502);
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    const detail = await upstream.text().catch(() => '');
    return jsonError(detail || `上游返回 ${upstream.status}`, upstream.status || 502);
  }

  const stream = new ReadableStream({
    async start(ctrl) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          ctrl.enqueue(value);
        }
      } catch (e: any) {
        const msg = `data: ${JSON.stringify({ type: 'error', error: e?.message || 'stream error' })}\n\n`;
        ctrl.enqueue(new TextEncoder().encode(msg));
      } finally {
        clearTimeout(timeout);
        ctrl.close();
      }
    },
    cancel() {
      clearTimeout(timeout);
      controller.abort();
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
};
