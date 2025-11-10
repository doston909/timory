import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class WatchService {
    constructor(@InjectModel('Watch') private readonly watchModel: Model<null>) {}
}
