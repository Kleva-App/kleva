import { Router } from "express";
import { z } from "zod";
import { getOptionalEnv } from "../lib/env.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";

export const aiRouter = Router();

const chatSchema = z.object({
  message: z.string().min(1),
});

/**
 * Optional OpenAI proxy. Set OPENAI_API_KEY to enable.
 */
aiRouter.post("/ai/assistant", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const body = chatSchema.parse(req.body);
    const apiKey = getOptionalEnv("OPENAI_API_KEY");

    if (!apiKey) {
      res.status(503).json({
        error: "AI assistant is not configured (set OPENAI_API_KEY)",
      });
      return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getOptionalEnv("OPENAI_MODEL", "gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: "You are Kleva, a helpful teaching assistant.",
          },
          { role: "user", content: body.message },
        ],
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };

    if (!response.ok) {
      res.status(response.status).json({
        error: payload.error?.message ?? "AI assistant request failed",
      });
      return;
    }

    res.json({
      reply: payload.choices?.[0]?.message?.content ?? "",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.flatten() });
      return;
    }
    res.status(500).json({
      error: err instanceof Error ? err.message : "AI assistant request failed",
    });
  }
});
