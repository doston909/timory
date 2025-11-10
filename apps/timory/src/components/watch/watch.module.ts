import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WatchResolver } from './watch.resolver';
import { WatchService } from './watch.service';
import WatchSchema from '../../schemas/Watch.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Watch',
				schema: WatchSchema,
			},
		]),
		AuthModule,
		ViewModule,
    MemberModule
	],
	providers: [WatchResolver, WatchService],
})
export class WatchModule {}
