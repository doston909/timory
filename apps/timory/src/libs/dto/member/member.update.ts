import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ObjectId } from 'mongoose';

@InputType()
export class MemberUpdate {
	@IsOptional()
	@Field(() => String, { nullable: true })
	_id?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberPhoto?: string;

	@IsOptional()
	@Length(2, 100)
	@Field(() => String, { nullable: true })
	memberName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberEmail?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberPhone?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberAddress?: string;
}