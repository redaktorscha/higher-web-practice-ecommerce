import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import runnerImage from '@/assets/runner.png';

type AuthLayoutProps = {
  title: string;
  mobileTitle?: string;
  footerText: string;
  footerLinkText: string;
  footerTo: string;
  desktopCardClassName: string;
  mobileFormClassName: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  mobileTitle = title,
  footerText,
  footerLinkText,
  footerTo,
  desktopCardClassName,
  mobileFormClassName,
  children,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[812px] bg-background md:min-h-[736px] md:overflow-hidden">
      <img
        alt=""
        className="pointer-events-none absolute top-[13px] left-[300px] hidden h-[655px] w-[1000px] object-contain md:block"
        src={runnerImage}
      />

      <div className="relative mx-auto min-h-[812px] w-full max-w-[375px] px-5 py-5 md:min-h-[736px] md:max-w-none md:px-0 md:py-0">
        <div className="flex h-8 items-center gap-2 md:hidden">
          <button
            aria-label="Назад"
            className="grid size-6 cursor-pointer place-items-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-6" strokeWidth={2.5} />
          </button>
          <div className="font-heading text-2xl leading-8 font-bold">{mobileTitle}</div>
        </div>

        <div className={desktopCardClassName}>
          <div className="font-heading hidden text-2xl leading-8 font-bold md:block">{title}</div>
          <div className={mobileFormClassName}>{children}</div>

          <div className="absolute bottom-6 left-6 hidden w-[332px] gap-1 md:grid">
            <p className="text-sm leading-5 text-muted-foreground">{footerText}</p>
            <Link to={footerTo} className="cursor-pointer text-sm leading-5 font-bold text-primary-hover outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {footerLinkText}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 grid w-[335px] gap-[5.95px] md:hidden">
          <p className="text-xs leading-4 text-[#9ca3af]">{footerText}</p>
          <Link to={footerTo} className="cursor-pointer text-sm leading-5 text-primary-hover outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {footerLinkText}
          </Link>
        </div>
      </div>
    </section>
  );
}
