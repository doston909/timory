import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';

@Module({
  imports: [MongooseModule.forFeature([
    {
      name: "Member", schema: MemberSchema
    },
  ]), 
  AuthModule, // Schema Model
  ViewModule  // Schema Model
],   
  providers: [
    MemberResolver, 
    MemberService
  ]
})
export class MemberModule {}
