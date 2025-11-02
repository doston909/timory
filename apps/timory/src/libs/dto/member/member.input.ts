import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { MemberAuthType, MemberType } from "../../enums/member.enum";


@InputType()
export class MemberInput {
    @IsNotEmpty()           // bo'sh bo'lmaslik sharti
    @Length(3, 12)          // uzunligi 3-12 orasida bo'lishi
    @Field(() => String)    // string qaytarishi sharti
    memberNick: string;

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword: string;

    @IsNotEmpty()
    @Field(() => String)
    memberPhone: string;

    @IsOptional()                                       // bo'lishi yoki bo'lmasligi ham mumkin
    @Field(() => MemberType, { nullable: true })        // MemberType shaklida data qaytarishi va bo'sh bo'lishi mumkinligi sharti
    memberType?: MemberType;                            // memberType type MemberType bo'lishi sharti

    @IsOptional()                                       // bo'lishi yoki bo'lmasligi ham mumkin
    @Field(() => MemberAuthType, { nullable: true })    // MemberAuthType shaklida data qaytarishi va bo'sh bo'lishi mumkinligi sharti
    memberAuthType?: MemberAuthType;                    // memberAuthType type MemberAuthType bo'lishi sharti
}

@InputType() 
export class LoginInput {
    @IsNotEmpty()            // Pipes
    @Length(3, 12)
    @Field(() => String)     // GraphQl
    memberNick: string;      // TypeScript

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword: string;
}
