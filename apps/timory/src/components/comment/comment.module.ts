import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { WatchModule } from '../watch/watch.module';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';

@Module({
  imports: [MongooseModule.forFeature([
      {
        name: "Comment",
        schema: CommentSchema
      },
    ]),
  AuthModule,
  MemberModule,
  WatchModule,
  BoardArticle,
], 
  providers: [CommentResolver, CommentService]
})
export class CommentModule {}
