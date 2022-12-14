import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

/*
** strategy will always return User Object, retrieved using
** payload.id
*/
@Injectable()
export class TfaStrategy extends PassportStrategy(Strategy, 'tfa') {
	constructor(
		private UsersService: UsersService,
		private jwtService: JwtService
	) {
		super({
			ignoreExpiration: false,
			passReqToCallback: true,
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		});
	}

	async validate(req: Request, payload: any) {
		if (!payload || !payload.id || !payload.tfa_fulfilled)
			throw new UnauthorizedException;
		return payload;
	}
}
