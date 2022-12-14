import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt'

/*
** In JwtRefreshStrategy, we check for the original token, but ignore its expiration.
** the token (as payload), as well as the request (passReqToCallback) are sent to validate function.
** From the request, we retrieve the refresh token, and check if it has not expired (jwtservice.verify())
** Also, from the original token, we retrieve the user. Then we check if the user from 
** the original token matches to holder of the refresh token on database.
*/
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor(
		private UsersService: UsersService,
		private jwtService: JwtService
	) {
		super({
			ignoreExpiration: true,
			passReqToCallback: true,
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		});
	}

	async validate(req: Request, payload: any) {
		const refreshtoken = req?.cookies['refresh_token'];

		if (!payload || !(refreshtoken))
			throw new UnauthorizedException;
		try {
			await this.jwtService.verify(refreshtoken, { secret: process.env.JWT_REFRESH_SECRET });
		} catch (err) {
			throw new UnauthorizedException;
		}
		const user_refreshtoken = await this.UsersService.getRefreshToken(payload.id);
		if (!user_refreshtoken || user_refreshtoken != refreshtoken)
			throw new UnauthorizedException;
		return payload;
	}
}
