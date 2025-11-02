import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
	MEN = "MEN",
    WOMEN = "WOMEN",
    UNISEX = "UNISEX",
    ELITE_SPORT = "ELITE-SPORT",
}
registerEnumType(PropertyType, {
	name: 'PropertyType',
});

export enum PropertyStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyLocation {
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
registerEnumType(PropertyLocation, {
	name: 'PropertyLocation',
});