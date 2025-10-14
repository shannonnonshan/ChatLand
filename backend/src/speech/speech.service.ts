import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class SpeechService {
  private COLAB_URL = 'https://unnullified-outragedly-junior.ngrok-free.dev/transcribe';

  async convertVoiceToText(file: Express.Multer.File): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname });

    const res = await axios.post(this.COLAB_URL, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });

    return { text: res.data.text };
  }
}
