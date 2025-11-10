import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { WatchLocation, WatchStatus, WatchType } from '../../enums/watch.enum';

@ObjectType()
export class Watch {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => WatchType)
	watchType: WatchType;

	@Field(() => WatchStatus)
	watchStatus: WatchStatus;

	@Field(() => WatchLocation)
	watchLocation: WatchLocation;

	@Field(() => String)
	watchAddress: string;

	@Field(() => String)
	watchTitle: string;

	@Field(() => Number)
	watchPrice: number;

	@Field(() => Int)
	watchViews: number;

	@Field(() => Int)
	watchLikes: number;

	@Field(() => Int)
	watchComments: number;

	@Field(() => Int)
	watchRank: number;

	@Field(() => [String])
	watchImages: string[];

	@Field(() => String, { nullable: true })
	watchDesc?: string;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => [String], { nullable: true })
	dealerIds?: string[];

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
