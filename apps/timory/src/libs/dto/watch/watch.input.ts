import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { WatchLocation, WatchType } from '../../enums/watch.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class WatchInput {
	@IsNotEmpty()
	@Field(() => WatchType)
	watchType: WatchType;

	@IsNotEmpty()
	@Field(() => WatchLocation)
	watchLocation: WatchLocation;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	watchAddress: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	watchTitle: string;

	@IsOptional()
	@Field(() => Number)
	watchPrice: number;

	@IsNotEmpty()
	@Field(() => [String])
	watchImages: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	watchDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	watchBarter?: boolean;

	@IsOptional()
	@Field(() => String, { nullable: true })
	watchBrand?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	watchModel?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	currency?: string;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	discountPercent?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	dealerIds?: string[];

	memberId?: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	makedAt?: Date;
}
