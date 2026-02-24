import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';
import { ViewGroup } from '../../enums/view.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ViewInput {
	@IsNotEmpty() // bo'sh bo'lmaslik shart
	@Field(() => String) // string qaytarishi sharti
	memberId: ObjectId;

	@IsNotEmpty() // bo'sh bo'lmaslik shart
	@Field(() => String) // string qaytarishi sharti
	viewRefId: ObjectId;

	@IsNotEmpty() // bo'sh bo'lmaslik shart
	@Field(() => ViewGroup) // string qaytarishi sharti
	viewGroup: ViewGroup;
}