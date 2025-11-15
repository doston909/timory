import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WatchService } from './watch.service';
import { Watch, Watches } from '../../libs/dto/watch/watch';
import {
	AllWatchesInquiry,
	BrandWatchesInquiry,
	DealerWatchesInquiry,
	OrdinaryInquiry,
	WatchesInquiry,
	WatchInput,
} from '../../libs/dto/watch/watch.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guards';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guards';
import { WatchUpdate } from '../../libs/dto/watch/watch.update';
import { AuthGuard } from '../auth/guards/auth.guards';

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

	@UseGuards(AuthGuard)
	@Query((returns) => Watches)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getFavorites');
		return await this.watchService.getFavorites(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => Watches)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Watches> {
		console.log('Query: getVisited');
		return await this.watchService.getVisited(memberId, input);
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

	@UseGuards(AuthGuard)
	@Mutation(() => Watch)
	public async likeTargetWatch(@Args('watchId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Watch> {
		console.log('Mutation: likeTargetWatch');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.watchService.likeTargetWatch(memberId, likeRefId);
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

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Watch)
	public async updateWatchByAdmin(@Args('input') input: WatchUpdate): Promise<Watch> {
		console.log('Mutation: updatePropertyByAdmin');
		return await this.watchService.updateWatchByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Watch)
	public async removeWatchByAdmin(@Args('propertyId') input: string): Promise<Watch> {
		console.log('Mutation: removePropertyByAdmin');
		const watchId = shapeIntoMongoObjectId(input);
		return await this.watchService.removeWatchByAdmin(watchId);
	}
}
