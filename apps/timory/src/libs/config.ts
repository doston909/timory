import { ObjectId } from 'bson';

export const availableBrandSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableDealerSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMembersSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];
export const availableWatchSorts = [
	'createdAt',
	'updatedAt',
	'watchLikes',
	'watchViews',
	'watchyRank',
	'watchPrice',
];
export const availableWatchOptions = [
  'AUTOMATIC',
  'CHRONOGRAPH',
  'WATER_RESISTANT',
  'LIMITED_EDITION',
  'DATE_DISPLAY',
  'POWER_RESERVE',
];

export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews']

 /** IMAGE CONFIGURATION **/
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === "string" ? new ObjectId(target) : target;
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};