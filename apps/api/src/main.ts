import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: config.get('frontendUrl'),
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Elimina propiedades no declaradas en DTOs
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const port = config.get<number>('port') ?? 3001
  await app.listen(port)
  console.log(`API corriendo en http://localhost:${port}/api`)
}

bootstrap()
