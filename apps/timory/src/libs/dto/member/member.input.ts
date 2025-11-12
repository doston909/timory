import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { availableBrandSorts, availableDealerSorts, availableMembersSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class MemberInput {
	@IsNotEmpty() // bo'sh bo'lmaslik sharti
	@Length(3, 12) // uzunligi 3-12 orasida bo'lishi
	@Field(() => String) // string qaytarishi sharti
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsOptional() // bo'lishi yoki bo'lmasligi ham mumkin
	@Field(() => MemberType, { nullable: true }) // MemberType shaklida data qaytarishi va bo'sh bo'lishi mumkinligi sharti
	memberType?: MemberType; // memberType type MemberType bo'lishi sharti

	@IsOptional() // bo'lishi yoki bo'lmasligi ham mumkin
	@Field(() => MemberAuthType, { nullable: true }) // MemberAuthType shaklida data qaytarishi va bo'sh bo'lishi mumkinligi sharti
	memberAuthType?: MemberAuthType; // memberAuthType type MemberAuthType bo'lishi sharti

	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	adminSecretKey?: string;
}

@InputType()
export class LoginInput {
	@IsNotEmpty() // Pipes
	@Length(3, 12)
	@Field(() => String) // GraphQl
	memberNick: string; // TypeScript

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;
}

@InputType()
class AISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class BrandsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableBrandSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AISearch)
	search: AISearch;
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