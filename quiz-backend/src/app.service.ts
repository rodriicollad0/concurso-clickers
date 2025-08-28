import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: '🎯 Quiz Clicker System API',
      version: '1.0.0',
      status: 'Running',
      endpoints: {
        quizzes: '/api/quiz',
        questions: '/api/quiz/:id/questions',
        participants: '/api/quiz/participants',
        websocket: 'ws://localhost:3000'
      },
      documentation: 'API funcionando correctamente'
    };
  }
}
