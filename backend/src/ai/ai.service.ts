import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly gemmaModel: any;
  private readonly hfToken?: string;

  constructor() {
    const apiKey = process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY;
    this.hfToken = process.env.HF_API_TOKEN;

    if (!apiKey) {
      throw new Error('Missing GEMMA_API_KEY or GEMINI_API_KEY environment variable');
    }

    // ✅ Ưu tiên dùng Gemma 3
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.gemmaModel = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
      this.logger.log('✅ Using Gemma 3 model');
    } catch (err) {
      this.logger.error('❌ Failed to initialize Gemma 3:', err);
      this.gemmaModel = null;
    }
  }

  async summarize(text: string): Promise<string> {
    if (!text?.trim()) return 'Không có nội dung để tóm tắt.';

    const prompt = `
      Tóm tắt nội dung tin nhắn sau một cách ngắn gọn, thân thiện, bằng tiếng Việt.
      Giữ đúng ý chính, không thêm bình luận.

      --- Nội dung ---
      ${text}
    `;

    // 🧠 Bước 1: thử với Gemma 3
    if (this.gemmaModel) {
      try {
        const result = await this.gemmaModel.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        if (summary?.trim()) return `🧠 ${summary.trim()}`;
      } catch (error) {
        this.logger.warn('⚠️ Gemma 3 summarize failed, switching to Phi-3:', error.message);
      }
    }

    // 🧩 Bước 2: fallback sang Phi-3
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.hfToken ? { Authorization: `Bearer ${this.hfToken}` } : {}),
          },
          body: JSON.stringify({ inputs: prompt }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const summary =
        data?.[0]?.generated_text ||
        data?.generated_text ||
        data?.summary_text ||
        null;

      return summary?.trim()
        ? `🤖 ${summary.trim()}`
        : 'Không có gì để tóm tắt 💤';
    } catch (error) {
      this.logger.error('Phi-3 fallback failed:', error);
      return 'Không thể tóm tắt nội dung (AI service lỗi).';
    }
  }
}
