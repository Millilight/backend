import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    console.log(exception);
    console.log(host);
    throw new InternalServerErrorException();
    // switch (exception.code) {
    //   case 11000:
    //   // duplicate exception
    // }
  }
}
