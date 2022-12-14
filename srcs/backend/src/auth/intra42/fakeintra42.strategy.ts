import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-strategy";
import { AuthService } from "../auth.service";
import { UserDTO } from "src/users/users.dto";
import { Request } from "express";
import { ParsedQs } from "qs";

/*
** implements a Fake strategy that generates a random User
*/

@Injectable()
export class FakeIntra42Strategy extends PassportStrategy(Strategy, 'fake42strategy')
{
    constructor(private authService: AuthService) {
        super();
    }

    async authenticate(req: Request<any, any, ParsedQs, Record<string, any>>, options?: any): Promise<void> {
        if (req.url == '/auth/login') {
            this.redirect('/auth/callback');
        }
        else {
            this.success(await this.validate());
        }
        return;
    }

    async validate(): Promise<any> {
        let user: UserDTO | null = null;
        try {
            const this_user = [
                { id: 19219, login: 'login1', displayname: 'displayname1', image: { link: 'fdgdsfgdfg' } },
                { id: 19220, login: 'login1', displayname: 'displayname2', image: { link: 'fdgdsfgdfg' } },
                { id: 19221, login: 'login1', displayname: 'displayname3', image: { link: 'fdgdsfgdfg' } },
                { id: 19222, login: 'login1', displayname: 'displayname4', image: { link: 'fdgdsfgdfg' } },
                { id: 19223, login: 'login1', displayname: 'displayname5', image: { link: 'fdgdsfgdfg' } },
                { id: 19224, login: 'login1', displayname: 'displayname6', image: { link: 'fdgdsfgdfg' } }
            ];
            const idx = Math.floor(Math.random() * (this_user.length));
            user = await this.authService.getOrCreateUser(this_user[idx]);
            if (!user)
                throw new UnauthorizedException();
        } catch (error) {
            throw new UnauthorizedException();
        }
        return (user);
    }
}
