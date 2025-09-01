import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 🩺 Health check endpoint para Render
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'quiz-backend'
    };
  }

  // 🔧 Debug endpoint para verificar CORS
  @Get('debug/cors')
  getDebugCors() {
    return {
      message: 'CORS test endpoint',
      timestamp: new Date().toISOString(),
      allowedOrigins: [
        'http://localhost:5173',
        'http://localhost:5174', 
        'https://concurso-clicker-app.onrender.com',
        'https://frontend-clickers.onrender.com',
        'any *.onrender.com subdomain'
      ]
    };
  }
}
