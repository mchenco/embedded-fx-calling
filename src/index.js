/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { createToolsFromOpenAPISpec, runWithTools, autoTrimTools } from "@cloudflare/ai-utils"

export default {
  async fetch(request, env, ctx) {

    const response = await runWithTools(
      env.AI,
      "@hf/nousresearch/hermes-2-pro-mistral-7b",
      {
        messages: [
          {
            role: "user",
            content: "Who is Cloudflare on github?"
          }
        ],
        tools: [
            // You can pass the OpenAPI spec link or contents directly
            ...await createToolsFromOpenAPISpec(
                'https://gist.githubusercontent.com/mchenco/fd8f20c8f06d50af40b94b0671273dc1/raw/f9d4b5cd5944cc32d6b34cad0406d96fd3acaca6/partial_api.github.com.json',
                { overrides: [{
                    // for all requests on *.github.com, we'll need to add a User-Agent and Authorization.
                    matcher: ({ url, method }) => {
                        return url.hostname === "api.github.com"
                    },
                    values: {
                        headers: {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",}
                    }
                }]}
            ),
        ]
      },   
      {
        // strictValidation: true,
        // streamFinalResponse: true,
        verbose: true,
        trimFunction: autoTrimTools,
      }
    ).then((response) => {
      return response
    })

    return new Response(JSON.stringify(response));
  }
}