import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { WatchModule } from '../watch/watch.module';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { BoardArticleModule } from '../board-article/board-article.module';

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
  BoardArticleModule,
], 
  providers: [CommentResolver, CommentService],
  exports: [CommentService]
})
export class CommentModule {}
