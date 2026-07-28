import '../styles';
import { mountKindApp } from '../mount';
import ConfidentialKindApp from '../confidential/ConfidentialKindApp.svelte';

void mountKindApp(ConfidentialKindApp, 'ERC7984');
