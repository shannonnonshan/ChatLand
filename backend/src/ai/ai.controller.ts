// src/ai/ai.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { InternalServerErrorException } from '@nestjs/common';
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("summarize")
    async summarize(@Body() body: { text: string }) {
    try {
        const { text } = body;
        if (!text?.trim()) throw new Error("Missing text");
        const summary = await this.aiService.summarize(text);
        return { summary };
    } catch (err) {
        console.error("Summarize failed:", err);
        throw new InternalServerErrorException("AI summarize failed");
    }
    }
}
