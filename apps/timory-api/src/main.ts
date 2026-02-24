import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import { WsAdapter } from '@nestjs/platform-ws';

const JSON_BODY_LIMIT = '10mb'; // base64 rasmlar (createWatch va boshqalar) uchun

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bodyParser: false });
	app.use(express.json({ limit: JSON_BODY_LIMIT }));
	app.use(express.urlencoded({ limit: JSON_BODY_LIMIT, extended: true }));

	app.useGlobalPipes(new ValidationPipe()); // Global Pipes validations
	app.useGlobalInterceptors(new LoggingInterceptor()); // req va resga javob beradi, logging
	app.enableCors({ origin: true, credentials: true });

	app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 }));
	app.use('/uploads', express.static('./uploads'));

	app.useWebSocketAdapter(new WsAdapter(app));
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
