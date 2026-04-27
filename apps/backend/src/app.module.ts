import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';

@Module({
  imports: [
    TRPCModule.forRoot({
      basePath: '/trpc',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
