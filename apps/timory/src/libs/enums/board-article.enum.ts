import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
	FREE = 'FREE',
	RECOMMEND = 'RECOMMEND',
	NEWS = 'NEWS',
	HUMOR = 'HUMOR',
}
registerEnumType(BoardArticleCategory, {
	name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
	PUBLISHING = 'PUBLISHING',
	DELETE = 'DELETE',
	REMOVE = 'REMOVE',
}
registerEnumType(BoardArticleStatus, {
	name: 'BoardArticleStatus',
});