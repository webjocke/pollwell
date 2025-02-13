import Mustache from "mustache";

export const html = (content: string, data: any = {}) =>
  new Response(Mustache.render(content, data), {
    headers: {
      "Content-Type": "text/html",
    },
  });
export const ok = (text: string) => new Response(text, { status: 200 });
export const json = (data: any) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
