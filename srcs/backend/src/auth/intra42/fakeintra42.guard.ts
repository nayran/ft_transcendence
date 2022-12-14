import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FakeIntra42Guard extends AuthGuard('fake42strategy') { }
