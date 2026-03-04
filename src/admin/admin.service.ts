import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
    getAdmins(): Array<object> {
        return [
            { name: 'faysal' },
            { name: 'siyam' },
            { name: 'shamin' },
            { name: 'chhoya' },
        ];
    }
}
