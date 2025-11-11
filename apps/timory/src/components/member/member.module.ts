import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import WatchSchema from '../../schemas/Watch.model';
import { WatchModule } from '../watch/watch.module';

@Module({
  imports: [MongooseModule.forFeature([
    {
      name: "Member", schema: MemberSchema
    },
     { name: 'Watch', schema: WatchSchema },
  ]), 
  AuthModule, // Schema Model
  ViewModule,  // Schema Model
],   
  providers: [
    MemberResolver, 
    MemberService
  ],
  exports: [MemberService]
})
export class MemberModule {}
