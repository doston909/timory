import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { WatchLocation, WatchStatus, WatchType } from '../../enums/watch.enum';
import type { ObjectId } from 'mongoose';

@InputType()
export class WatchUpdate {

  @IsNotEmpty()
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => WatchType, { nullable: true })
  watchType?: WatchType;

  @IsOptional()
  @Field(() => WatchStatus, { nullable: true })
  watchStatus?: WatchStatus;

  @IsOptional()
  @Field(() => WatchLocation, { nullable: true })
  watchLocation?: WatchLocation;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchAddress?: string;

  @IsOptional()
  @Length(2, 200)
  @Field(() => String, { nullable: true })
  watchModelName?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  watchLimitedEdition?: boolean;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  watchPrice?: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  watchImages?: string[];

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchBrand?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchColor?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchCaseShape?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchCaseSize?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchCountry?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchMakeData?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  watchWaterResistance?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  watchAvailability?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchMaterial?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  watchDescription?: string;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
