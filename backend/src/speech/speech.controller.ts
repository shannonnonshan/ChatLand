import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('voice-to-text')
  @UseInterceptors(FileInterceptor('file'))
  async voiceToText(@UploadedFile() file: Express.Multer.File) {
    // file.buffer là blob từ frontend
    const result = await this.speechService.convertVoiceToText(file);
    return result;
  }
}
