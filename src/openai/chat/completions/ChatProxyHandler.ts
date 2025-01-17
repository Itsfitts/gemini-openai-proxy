import type { Handler } from "hono"

import { ContextWithLogger } from "../../../app.ts"
import type { OpenAI } from "../../../types.ts"
import { getToken } from "../../../utils.ts"
import { ApiParam } from "../../../utils.ts"
import { nonStreamingChatProxyHandler } from "./NonStreamingChatProxyHandler.ts"
import { streamingChatProxyHandler } from "./StreamingChatProxyHandler.ts"

export const chatProxyHandler: Handler = async (c: ContextWithLogger) => {
  const log = c.var.log

  const req = await c.req.json<OpenAI.Chat.ChatCompletionCreateParams>()
  log.debug(req)
  const headers = c.req.header()
  const apiParam = getToken(headers)
  if (apiParam == null) {
    return c.text("Unauthorized", 401)
  }

  if (req.stream === true) {
    return streamingChatProxyHandler(c, req, apiParam)
  }
  return nonStreamingChatProxyHandler(c, req, apiParam)
}

export interface ChatProxyHandlerType {
  (c: ContextWithLogger, req: OpenAI.Chat.ChatCompletionCreateParams, apiParam: ApiParam): Promise<Response>
}
