import '../styles';
import { mountKindApp } from '../mount';
import CairoKindApp from '../cairo/CairoKindApp.svelte';

void mountKindApp(CairoKindApp, 'ERC20');
