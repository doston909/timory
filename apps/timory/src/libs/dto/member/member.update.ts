import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { MemberStatus, MemberType } from "../../enums/member.enum";
import { ObjectId } from "mongoose";


@InputType()
export class MemberUpdate {

    @IsNotEmpty()
    @Field(() => String)
    _id: ObjectId;

    @IsOptional()                                       // bo'lishi yoki bo'lmasligi ham mumkin
    @Field(() => MemberType, { nullable: true })        // MemberType shaklida data qaytarishi va bo'sh bo'lishi mumkinligi sharti
    memberType?: MemberType;  
    
    @IsOptional()                                       // bo'lishi yoki bo'lmasligi ham mumkin
    @Field(() => MemberStatus, { nullable: true })        // MemberType shaklida data qaytarishi va bo'sh bo'lishi mumkinligi sharti
    memberStatus?: MemberStatus;   

    @IsOptional()
    @Field(() => String, { nullable: true })
    memberPhone?: string;

    @IsOptional()
    @Length(3, 12)          // uzunligi 3-12 orasida bo'lishi
    @Field(() => String, { nullable: true })    // string qaytarishi sharti
    memberNick?: string;

    @IsOptional()
    @Length(5, 12)
    @Field(() => String, { nullable: true })
    memberPassword?: string;

    @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    memberFullName?: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    memberImage?: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    memberAddress?: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    memberDesc?: string;

    deleteAt?: Date;
}