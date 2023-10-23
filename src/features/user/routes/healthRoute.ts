import express, { Router, Request, Response } from 'express';
import moment from 'moment';
import HTTP_STATUS from 'http-status-codes';


class HealthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public health(): Router {
    this.router.get('/health', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.OK).send(`Health: Server instance is healthy with process id ${process.pid} on ${moment().format('LL')}`);
    });

    return this.router;
  }



}

export const healthRoutes: HealthRoutes = new HealthRoutes();