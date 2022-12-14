import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom, firstValueFrom, catchError } from 'rxjs';
import { AuthService } from "../auth.service";


@Injectable()
export class Intra42Strategy extends PassportStrategy(Strategy, "intra42")
{
	constructor(
		private authService: AuthService,
		private readonly httpService: HttpService) {
		super({
			passReqToCallback: true,
			clientID: process.env.CLIENT_ID,
			authorizationURL: process.env.BASE_URL + "/oauth/authorize",
			tokenURL: process.env.BASE_URL + "/oauth/token",
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "/auth/callback",
		})
	}

	async validate(req: Request, accessToken: string, refreshToken: string): Promise<any> {
		let user: any = null;
		let header = { Authorization: `Bearer ${accessToken}` }
		const  data  = await firstValueFrom (this.httpService.get(process.env.BASE_URL + "/v2/me", {headers: header}));
		try {
			user = await this.authService.getOrCreateUser(data.data);		
		} catch (error) {}
		return (user);
	}
}
