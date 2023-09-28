import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = ({ url }) => {
  const lang = url.searchParams.get('lang');
  throw redirect(302, `/embed/${lang}`);
};
