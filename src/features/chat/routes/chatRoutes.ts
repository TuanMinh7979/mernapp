import { Add } from '@chat/controllers/add-chat-messages';
import { authMiddleware } from '@global/helpers/aurth-middleware';
import express, { Router } from 'express';



class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {

    this.router.post('/chat/message/add-chat-users', authMiddleware.checkAuthencation, Add.prototype.message);


    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();