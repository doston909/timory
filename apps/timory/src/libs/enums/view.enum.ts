import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	WATCH = 'WATCH',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
