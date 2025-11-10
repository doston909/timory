import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WatchService } from './watch.service';
import { Watch } from '../../libs/dto/watch/watch';
import { WatchInput } from '../../libs/dto/watch/watch.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guards';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guards';
import { WatchUpdate } from '../../libs/dto/watch/watch.update';

@Resolver()
export class WatchResolver {
	constructor(private readonly watchService: WatchService) {}

@Roles(MemberType.BRAND)
@UseGuards(RolesGuard)
@Mutation(() => Watch)
public async createBrandWatch(
	@Args('input') input: WatchInput,
	@AuthMember('_id') memberId: ObjectId,
): Promise<Watch> {
	console.log('Mutation: createBrandWatch');
	input.memberId = memberId;
	return await this.watchService.createBrandWatch(input);
}

@Roles(MemberType.DEALER)
@UseGuards(RolesGuard)
@Mutation(() => Watch)
public async createDealerWatch(
	@Args('input') input: WatchInput,
	@AuthMember('_id') memberId: ObjectId,
): Promise<Watch> {
	console.log('Mutation: createDealerWatch');
	input.memberId = memberId;
	return await this.watchService.createDealerWatch(input);
}

@UseGuards(WithoutGuard)
@Query((returns) => Watch)
public async getWatch(
	@Args('watchId') input: string,
	@AuthMember('_id') memberId: ObjectId,
): Promise<Watch> {
	console.log('Query: getWatch');
	const watchtId = shapeIntoMongoObjectId(input);
	return await this.watchService.getWatch(memberId, watchtId);
}

@Roles(MemberType.BRAND, MemberType.DEALER)
@UseGuards(RolesGuard)
@Mutation((returns) => Watch)
public async updateWatch(
    @Args('input') input: WatchUpdate,
    @AuthMember('_id') memberId: ObjectId,
): Promise<Watch> {
    console.log("Mutation: updateWatch");
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.watchService.updateWatch(memberId, input);
}

}
