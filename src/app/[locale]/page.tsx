import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import MissionSection from '@/components/MissionSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import ImpactSection from '@/components/ImpactSection';
import TeamSection from '@/components/TeamSection';
import ProjectsSection from '@/components/ProjectsSection';
import EventsSection from '@/components/EventsSection';
import JoinSection from '@/components/JoinSection';
import Footer from '@/components/Footer';
import { getTeamMembersForDisplay } from '@/lib/team/repository';
import { getProjects } from '@/lib/projects/repository';
import { getPublicEvents } from '@/lib/events/repository';

export default async function Home() {
  const locale = (await getLocale()) as 'fr' | 'en';
  const [teamMembers, projects, events] = await Promise.all([
    getTeamMembersForDisplay(),
    getProjects(true),
    getPublicEvents(6),
  ]);

  return (
    <div className="relative font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden scroll-smooth">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/assets/hero-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      <main className="flex flex-col">
        <HeroSection />
        <ProblemSection />
        <MissionSection />
        <ExpertiseSection />
        <ImpactSection />
        <TeamSection initialMembers={teamMembers} locale={locale} />
        <ProjectsSection initialProjects={projects} />
        <EventsSection initialEvents={events} />
        <JoinSection />
      </main>

      <Footer />
    </div>
  );
}
