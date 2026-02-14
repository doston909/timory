import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { WatchLocation, WatchStatus, WatchType } from '../../enums/watch.enum';
import { ObjectId } from 'mongoose';

import { Direction } from '../../enums/common.enum';
import { availableWatchOptions, availableWatchSorts } from '../../config';

@InputType()
export class WatchInput {
	@IsNotEmpty()
	@Field(() => [String])
	watchImages: string[];

	@IsNotEmpty()
	@Length(2, 200)
	@Field(() => String)
	watchModelName: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	watchLimitedEdition?: boolean;

	@IsOptional()
	@Field(() => String, { nullable: true })
	watchBrand?: string;

	@IsNotEmpty()
	@Field(() => WatchType)
	watchType: WatchType;

	@IsNotEmpty()
	@Field(() => Number)
	watchPrice: number;

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

	memberId?: ObjectId;
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
class DWISearch {
	@IsOptional()
	@Field(() => WatchStatus, { nullable: true })
	watchStatus?: WatchStatus;

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

@InputType()
class ALWISearch {
	@IsOptional()
	@Field(() => WatchStatus, { nullable: true })
	watchStatus?: WatchStatus;

	@IsOptional()
	@Field(() => [WatchLocation], { nullable: true })
	watchLocationList?: WatchLocation[];

	@IsOptional()
	@Field(() => [WatchType], { nullable: true })
	watchTypeList?: WatchType[];
}

@InputType()
export class AllWatchesInquiry {
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
	@Field(() => ALWISearch)
	search: ALWISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
