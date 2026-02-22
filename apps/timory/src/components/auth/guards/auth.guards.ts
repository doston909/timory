import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from 'apps/timory/src/libs/enums/common.enum';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		console.info('--- @guard() Authentication [AuthGuard] ---');

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req; // bu yerda context ichdagi reqni tanlab oldim, ichida body, header va boshqalar bor

			const bearerToken = request.headers.authorization; // bu yerda header ichidan authorization ni bearerTokenga tenglab oldim, uni postmandan authorization deb yuborganman
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

			const token = bearerToken.split(' ')[1], // bu yerda faqat token qismini ajratib oldim va AuthService orqali tekshiriladi.
				authMember = await this.authService.verifyToken(token);
			if (!authMember) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

			console.log('memberName[auth] =>', authMember.memberName);
			request.body.authMember = authMember; // be yerda authMember obyektini request body’ga qo‘shdim va uni resolver yoki service da oson ishlata olaman

			return true;
		}

		// description => http, rpc, gprs and etc are ignored
	}
}