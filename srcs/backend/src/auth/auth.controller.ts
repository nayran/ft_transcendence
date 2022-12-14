import { Controller, Get, Post, UseGuards, Request, Response, Res, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt/jwt.guard';
import { JwtRefreshGuard } from './jwt/jwtrefresh.guard';
import { Intra42Guard } from './intra42/intra42.guard';
import { FakeIntra42Guard } from './intra42/fakeintra42.guard';
import { TfaGuard } from './tfa/tfa.guard';
import { UsersService } from 'src/users/users.service';
import { UserDTO } from 'src/users/users.dto';
import { ConnectedUsersService } from 'src/services/connected-user/connected-user.service';

@Controller("auth")
export class AuthController {

	constructor(
		private authService: AuthService,
		private UsersService: UsersService,
		private connectedUsersService: ConnectedUsersService
	) { }


	/*
	** login routed, requested by the frontend (/auth/login)
	** since the user is not logged in yet, only intra42 guard is used
	*/

	@UseGuards(Intra42Guard)
	@Get("login")
	async login(@Request() req, @Response() res) {
		return;
	}

	/*
	** /auth/callback is the intra's return
	*/

	@UseGuards(Intra42Guard)
	@Get("callback")
	async callback(@Response() res, @Request() req) {
		if (req.user) {
			const random_code: string = await this.authService.generateCallbackCode(req.user.id)
			res.status(200).redirect('/login/callback?code=' + random_code);
		}
		else {
			res.status(401).redirect('/login/callback');
		}
	}

	@UseGuards(JwtGuard)
	@Get('profile')
	async profile(@Request() req, @Res({ passthrough: true }) res) {
		let user: UserDTO;
		try {
			user = UserDTO.from(await this.UsersService.getUser(req.user.id));
			user.tfa_fulfilled = (!(await this.UsersService.getTfaEnabled(req.user.id)) || req.user.tfa_fulfilled);
		} catch {
			res.sendStatus(401);
			return;
		}
		return (JSON.stringify(user));
	}

	@Get('token/:code')
	async token(@Param('code') code, @Res({ passthrough: true }) res) {
		const callback_code: { username: string, id: number } | null = await this.authService.retrieveCallbackToken(code);
		if (!(callback_code)) {
			res.sendStatus(401);
			return;
		}
		const refreshtoken = await this.authService.getRefreshToken({ username: callback_code.username, id: callback_code.id });
		const callback_token: string = await this.authService.getAccessToken({ username: callback_code.username, id: callback_code.id });
		res.cookie('refresh_token', refreshtoken, { httpOnly: true });
		await this.UsersService.updateRefreshToken(callback_code.id, refreshtoken);
		return { token: callback_token };
	}

	/*
	**
	*/
	@UseGuards(JwtGuard)
	@Get('logout')
	async logout(@Res({ passthrough: true }) res, @Request() req) {
		let user: UserDTO = UserDTO.from(await this.UsersService.getUser(req.user.id));
		res.clearCookie('refresh_token', { httpOnly: true });
		return { msg: "success" };
	}

	/*
	** refresh Token
	*/
	@UseGuards(JwtRefreshGuard)
	@Get('refreshtoken')
	async refreshToken(@Response() res, @Request() req) {
		const token: string = await this.authService.getAccessToken(req.user, req.user.tfa_fulfilled);
		res.status(200).send({ token: token });
	}

	/*
	** sample of endpoint
	*/
	@UseGuards(TfaGuard)
	@Get('data')
	async getdata(@Response() res) {
		res.status(200).send({ msg: 'success' });
	}

	/*
	** 2FA
	*/

	/*
	** retrieves keycode + qrcode
	*/
	@UseGuards(JwtGuard)
	@Get('tfa_retrieve')
	async get_tfa(@Request() req) {
		let key_code: any = await this.authService.generateTFA(req.user.id);
		return (JSON.stringify(key_code));
	}


	@UseGuards(TfaGuard)
	@Post('tfa_disable')
	async activate_tfa(@Request() req) {
		return await this.authService.disableTwoFactor(req.user.id);
	}

	@UseGuards(JwtGuard)
	@Post('tfa_verify')
	async verify_tfa(@Body() body: any, @Request() req, @Response() res): Promise<any> {
		const verified: boolean = await this.authService.verifyTwoFactor(req.user.id, body.code);
		let callback_token: string = null;
		if (verified) {
			callback_token = await this.authService.getAccessToken({ username: req.user.username, id: req.user.id }, true);
		}
		res.send(JSON.stringify({ msg: verified, token: callback_token }));
		return;
	}
}
