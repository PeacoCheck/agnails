import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';
import { buildSeoMetadata, getSeoLanding } from '@/lib/seo-landings';

const landing = getSeoLanding('dizayn-nogtey-samara');

export const revalidate = 60;

export function generateMetadata(): Metadata {
  return buildSeoMetadata(landing);
}

export default function Page() {
  return <SeoLandingPage landing={landing} />;
}
