import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WatchService } from './watch.service';
import { Watch, Watches } from '../../libs/dto/watch/watch';
import { AllWatchesInquiry, BrandWatchesInquiry, DealerWatchesInquiry, WatchesInquiry, WatchInput } from '../../libs/dto/watch/watch.input';
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
	public async getWatch(@Args('watchId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Watch> {
		console.log('Query: getWatch');
		const watchtId = shapeIntoMongoObjectId(input);
		return await this.watchService.getWatch(memberId, watchtId);
	}

	@Roles(MemberType.BRAND, MemberType.DEALER)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Watch)
	public async updateWatch(@Args('input') input: WatchUpdate, @AuthMember('_id') memberId: ObjectId): Promise<Watch> {
		console.log('Mutation: updateWatch');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.watchService.updateWatch(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Watches)
	public async getWatches(
		@Args('input') input: WatchesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getWatches');
		return await this.watchService.getWatches(memberId, input);
	}

	@Roles(MemberType.BRAND)
	@UseGuards(RolesGuard)
	@Query(() => Watches) // GraphQL’da qaytadigan obyekt turi (Watches yoki WatchList)
	public async getBrandWatches(
		@Args('input') input: BrandWatchesInquiry,
		@AuthMember('_id') brandId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getBrandWatches');
		return await this.watchService.getBrandWatches(brandId, input);
	}

	@Roles(MemberType.DEALER)
	@UseGuards(RolesGuard)
	@Query(() => Watches)
	public async getDealerWatches(
		@Args('input') input: DealerWatchesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getDealerWatches');
		return await this.watchService.getDealerWatches(memberId, input);
	}

	/** ADMIN **/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Watches)
	public async getAllWatchesByAdmin(
		@Args('input') input: AllWatchesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getAllWatchesByAdmin');
		return await this.watchService.getAllWatchesByAdmin(input);
	}
}
