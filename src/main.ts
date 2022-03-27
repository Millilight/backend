import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.useGlobalPipes(new ValidationPipe());

  // Get app config for cors settings and starting the app.
  const config = app.get<ConfigService>(ConfigService);
  await app.listen(config.get<string>("app.port"));
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
