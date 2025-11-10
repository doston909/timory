import { Resolver } from '@nestjs/graphql';
import { WatchService } from './watch.service';

@Resolver()
export class WatchResolver {
    constructor(private readonly watchService: WatchService) {}
}
