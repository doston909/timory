import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { WatchLocation, WatchStatus, WatchType } from '../../enums/watch.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Watch {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => WatchType)
	watchType: WatchType;

	@Field(() => WatchStatus)
	watchStatus: WatchStatus;

	@Field(() => WatchLocation, { nullable: true })
	watchLocation?: WatchLocation;

	@Field(() => String, { nullable: true })
	watchAddress?: string;

	@Field(() => String)
	watchModelName: string;

	@Field(() => Boolean, { nullable: true })
	watchLimitedEdition?: boolean;

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
	watchBrand?: string;

	@Field(() => String, { nullable: true })
	watchColor?: string;

	@Field(() => String, { nullable: true })
	watchCaseShape?: string;

	@Field(() => String, { nullable: true })
	watchCaseSize?: string;

	@Field(() => String, { nullable: true })
	watchCountry?: string;

	@Field(() => String, { nullable: true })
	watchMakeData?: string;

	@Field(() => Number, { nullable: true })
	watchWaterResistance?: number;

	@Field(() => Number, { nullable: true })
	watchAvailability?: number;

	@Field(() => String, { nullable: true })
	watchMaterial?: string;

	@Field(() => String, { nullable: true })
	watchDescription?: string;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Watches {
	@Field(() => [Watch])
	list: Watch[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
