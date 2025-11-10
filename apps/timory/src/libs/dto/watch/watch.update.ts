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
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  watchAddress?: string;

  @IsOptional()
  @Length(3, 100)
  @Field(() => String, { nullable: true })
  watchTitle?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  watchPrice?: number;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  watchImages?: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  watchDesc?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  dealerIds?: string[];

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
