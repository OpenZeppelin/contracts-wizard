import { mountKindApp } from '../mount';
import { stellarAdapter } from '../stellar/adapter';

void mountKindApp(stellarAdapter, 'NonFungible');
