import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { WatchLocation, WatchStatus, WatchType } from '../../enums/watch.enum';
import { ObjectId } from 'mongoose';

import { Direction } from '../../enums/common.enum';
import { availableWatchOptions, availableWatchSorts } from '../../config';

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

@InputType()
export class PricesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class SizesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class PeriodsRange {
	@Field(() => Date)
	start: Date;

	@Field(() => Date)
	end: Date;
}

// --- Search Filter ---
@InputType()
class WISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	brandId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	dealerId?: ObjectId; 

	@IsOptional()
	@Field(() => [WatchType], { nullable: true })
	typeList?: WatchType[]; 

	@IsOptional()
	@Field(() => [WatchStatus], { nullable: true })
	statusList?: WatchStatus[]; 

	@IsOptional()
	@Field(() => [WatchLocation], { nullable: true })
	locationList?: WatchLocation[]; 

	@IsOptional()
	@IsIn(availableWatchOptions, { each: true })
	@Field(() => [String], { nullable: true })
	options?: string[]; 

	@IsOptional()
	@Field(() => PricesRange, { nullable: true })
	pricesRange?: PricesRange; 

	@IsOptional()
	@Field(() => SizesRange, { nullable: true })
	sizesRange?: SizesRange; 

	@IsOptional()
	@Field(() => PeriodsRange, { nullable: true })
	periodsRange?: PeriodsRange; 

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string; 
}


@InputType()
export class WatchesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableWatchSorts)
	@Field(() => String, { nullable: true })
	sort?: string; 

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => WISearch)
	search: WISearch;
}

@InputType()
class BWISearch {
  @IsOptional()
  @Field(() => WatchStatus, { nullable: true })
  watchStatus?: WatchStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  brandId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class BrandWatchesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableWatchSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => BWISearch)
  search: BWISearch;
}


@InputType()
class DWISearch {
  @IsOptional()
  @Field(() => WatchStatus, { nullable: true })
  watchStatus?: WatchStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  dealerId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  brandId?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class DealerWatchesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableWatchSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => DWISearch)
  search: DWISearch;
}
