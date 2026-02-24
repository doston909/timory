import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Match } from '../../decorators/match.decorator';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { availableDealerSorts, availableMembersSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class MemberInput {
	@IsNotEmpty()
	@Length(2, 100)
	@Field(() => String)
	memberName: string;

	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	memberEmail: string;

	@IsNotEmpty()
	@Length(5, 50)
	@Field(() => String)
	memberPassword: string;

	@IsNotEmpty()
	@Length(5, 50)
	@Match('memberPassword', { message: 'memberConfirmPassword must match memberPassword' })
	@Field(() => String)
	memberConfirmPassword: string;

	@IsNotEmpty()
	@IsEnum(MemberType)
	@Field(() => MemberType)
	memberType: MemberType;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(2, 100)
	@Field(() => String)
	memberName: string;

	@IsNotEmpty()
	@Length(5, 50)
	@Field(() => String)
	memberPassword: string;
}

@InputType()
export class LoginWithGoogleInput {
	@IsNotEmpty()
	@Field(() => String)
	googleIdToken: string;

	@IsOptional()
	@IsEnum(MemberType)
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;
}

@InputType()
class AISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class DealersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableDealerSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: string;

	@IsNotEmpty()
	@Field(() => AISearch)
	search: AISearch;
}

@InputType()
class MISearch {

    @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus;

    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class MembersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn([availableMembersSorts])
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => MISearch)
	search: MISearch;
}