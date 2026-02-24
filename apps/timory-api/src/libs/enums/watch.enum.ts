import { registerEnumType } from '@nestjs/graphql';

export enum WatchType {
	MEN = "MEN",
    WOMEN = "WOMEN",
    UNISEX = "UNISEX",
    ELITE_SPORT = "ELITE-SPORT",
}
registerEnumType(WatchType, {
	name: 'WatchType',
});

export enum WatchStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(WatchStatus, {
	name: 'WatchStatus',
});

export enum WatchLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
    TOKIO = 'TOKIO',
    LONDON = 'LONDON',
    BERLIN = 'BERLIN',
    MOSCOW = 'MOSCOW',
    NEW_YORK = 'NEW-YORK',
}
registerEnumType(WatchLocation, {
	name: 'WatchLocation',
});