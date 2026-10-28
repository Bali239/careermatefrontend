import Link from 'next/link';
import HealthStatus from '@/components/layout/HealthStatus';
import LandingIcon from '@/components/ui/LandingIcon';
import AuthLinks from '@/components/auth/AuthLinks';

const features = [
  {
    icon: <LandingIcon name="fileSearch" />,
    title: 'Understand your CV',
    description: 'Turn your experience into a clear picture of your strengths and opportunities.',
    color: 'bg-[#f0edff] text-[#6958d6]',
  },
  {
    icon: <LandingIcon name="bulb" />,
    title: 'Find your next step',
    description: 'Get practical guidance to help you focus your career search.',
    color: 'bg-[#fff3e6] text-[#c58142]',
  },
  {
    icon: <LandingIcon name="safety" />,
    title: 'Stay in control',
    description: 'Your career journey is personal. Your information should be handled with care.',
    color: 'bg-[#e8f7f0] text-[#3d9a76]',
  },
];

export default function Home() {
  return (
    <main className="relative mx-auto max-w-[1440px] overflow-hidden px-[22px] sm:px-[5%] xl:px-[7.2%]">
      <div className="public-grid pointer-events-none absolute inset-x-0 top-0 h-[700px] opacity-80" />
      <div className="pointer-events-none absolute -right-48 top-[-220px] size-[560px] rounded-full bg-[#dcd5ff]/55 blur-3xl" />
      <header className="relative z-10 flex h-[76px] items-center justify-between border-b border-[#ebe8f4]/80 sm:h-[92px]">
        <a
          className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-1px] text-[#1e2440]"
          href="#home"
          aria-label="AI Career Assistant home"
        >
          <span className="grid size-[35px] place-items-center rounded-[12px] bg-gradient-to-br from-[#917ff3] to-[#5b47ca] text-white shadow-[0_8px_20px_#6958d640]">
            <LandingIcon name="star" />
          </span>
          <span>
            career<span className="text-[#6958d6]">mate</span>
          </span>
        </a>
        <nav
          className="hidden items-center gap-5 text-[12px] font-semibold text-[#77758e] sm:flex lg:gap-[38px]"
          aria-label="Main navigation"
        >
          <a className="transition hover:text-[#6958d6]" href="#features">
            How it works
          </a>
          <a className="transition hover:text-[#6958d6]" href="#about">
            About
          </a>
        </nav>
        <div>
          <AuthLinks />
        </div>
      </header>

      <section
        className="relative z-[1] grid items-center gap-6 py-[64px] sm:gap-5 sm:py-[72px] lg:min-h-[630px] lg:grid-cols-[1.02fr_.98fr] lg:gap-12 lg:py-[86px]"
        id="home"
      >
        <div className="relative z-[1] max-w-[590px]">
          <div className="inline-flex items-center gap-[9px] text-[10px] font-extrabold tracking-[1.5px] text-[#6958d6]">
            <span className="size-[7px] rounded-full bg-[#8d7cf0] shadow-[0_0_0_4px_#f1efff]" />{' '}
            YOUR NEXT CHAPTER STARTS HERE
          </div>
          <h1 className="reveal-up my-5 max-w-[650px] text-[clamp(43px,11vw,62px)] font-bold leading-[1.04] tracking-[-2.8px] text-[#18162e] sm:text-[clamp(44px,5.5vw,69px)] sm:tracking-[-4px]">
            Make your next career move{' '}
            <span className="block bg-gradient-to-r from-[#806ceb] via-[#6958d6] to-[#4f3abf] bg-clip-text text-transparent">with confidence.</span>
          </h1>
          <p className="reveal-up reveal-delay-1 max-w-[470px] text-[15px] leading-[1.85] text-[#77758e]">
            A thoughtful assistant for understanding your experience, exploring opportunities, and
            finding a direction that fits you.
          </p>
          <div className="reveal-up reveal-delay-2 mt-[30px] flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              className="inline-flex items-center gap-3 rounded-[12px] bg-gradient-to-r from-[#7967e9] to-[#5d49ce] px-5 py-3.5 text-xs font-bold text-white shadow-[0_12px_24px_#6958d644] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_#6958d655]"
              href="/auth/signup"
            >
              Get started <LandingIcon name="arrow" />
            </Link>
            <a className="text-xs font-bold text-[#6958d6]" href="#features">
              Explore what you can do
            </a>
            <span className="text-[11px] text-[#9095a9]">A clearer path, one step at a time.</span>
          </div>
          <div className="mt-[43px] flex items-center gap-[13px]">
            <div className="flex pl-0.5" aria-hidden="true">
              <span className="-ml-[3px] grid size-[29px] place-items-center rounded-full border-2 border-white bg-[#ece7ff] text-[9px] font-extrabold text-[#585177]">
                A
              </span>
              <span className="-ml-[3px] grid size-[29px] place-items-center rounded-full border-2 border-white bg-[#f7e5dc] text-[9px] font-extrabold text-[#865948]">
                M
              </span>
              <span className="-ml-[3px] grid size-[29px] place-items-center rounded-full border-2 border-white bg-[#dff2e9] text-[9px] font-extrabold text-[#457361]">
                S
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-[#9297aa]">
              Built to help you move forward
              <br />
              <strong className="text-[#555b74]">at your own pace</strong>
            </p>
          </div>
        </div>

        <div
          className="reveal-up reveal-delay-2 relative isolate grid min-h-[370px] place-items-center sm:min-h-[430px]"
          aria-label="Career progress illustration"
        >
          <div className="absolute -z-20 size-[350px] rounded-full bg-[radial-gradient(circle,#f3efff_0,#faf9ff_55%,transparent_70%)] sm:size-[410px]" />
          <div className="absolute -z-10 h-[190px] w-[390px] rotate-[-20deg] rounded-[50%] border border-[#e7e1ff] sm:h-[215px] sm:w-[490px]" />
          <div className="absolute -z-10 h-[260px] w-[360px] rotate-[48deg] rounded-[50%] border border-[#e7e1ff] sm:h-[300px] sm:w-[430px]" />
          <div className="float-slow relative z-[1] w-[min(360px,78vw)] rounded-[22px] border border-white/80 bg-white/90 px-6 py-6 shadow-[0_30px_80px_#3b2c8520,0_4px_14px_#3b2c850b] backdrop-blur-xl">
            <div className="flex items-center gap-[9px] text-[8px] font-extrabold tracking-[1.1px] text-[#9b9daf]">
              <span className="grid size-[27px] place-items-center rounded-[9px] bg-[#f0edff] text-[#6958d6]">
                <LandingIcon name="star" />
              </span>
              <span>YOUR CAREER SNAPSHOT</span>
              <span className="ml-auto size-1.5 rounded-full bg-[#74c8a2] shadow-[0_0_0_4px_#e8f8f0]" />
            </div>
            <div className="mt-[27px] text-[21px] leading-[1.4] tracking-[-.6px]">
              A little more clarity.
              <br />
              <strong className="text-[#6958d6]">A lot more possibility.</strong>
            </div>
            <div className="mt-[21px] h-[5px] overflow-hidden rounded-lg bg-[#f0eff6]">
              <span className="block h-full w-[68%] rounded-lg bg-gradient-to-r from-[#a49af0] to-[#6958d6]" />
            </div>
            <div className="mt-[17px] flex justify-between text-[9px] text-[#9296a9]">
              <span>Experience</span>
              <span className="font-bold text-[#5baf89]">Growing</span>
            </div>
            <div className="mt-[17px] flex h-[57px] items-end gap-1.5">
              {[30, 55, 78, 30, 55, 78, 30, 55, 78, 30, 55, 78].map((height, index) => (
                <i
                  key={index}
                  style={{ height: `${height}%` }}
                  className={`flex-1 rounded-t bg-[#e3defc] ${[3, 7, 11].includes(index) ? '!bg-[#8d7ce8]' : ''}`}
                />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#f0eff5] pt-4 text-[10px] font-bold text-[#6958d6]">
              <span>Explore your strengths</span>
              <LandingIcon name="arrow" />
            </div>
          </div>
          <div className="float-delay absolute right-0 top-[27px] z-[2] flex items-center gap-2.5 rounded-[14px] border border-white/80 bg-white/90 px-3.5 py-3 shadow-[0_16px_40px_#382b7820] backdrop-blur-xl sm:right-[-8px] sm:top-[50px]">
            <span className="grid size-[31px] place-items-center rounded-[10px] bg-[#f0edff] text-[#6958d6]">
              <LandingIcon name="bulb" />
            </span>
            <span>
              <strong className="block text-[9px] text-[#454a64]">Find your focus</strong>
              <small className="mt-1 block text-[8px] text-[#9a9eb0]">One step at a time</small>
            </span>
          </div>
          <div className="float-delay absolute bottom-[25px] left-0 z-[2] flex items-center gap-2.5 rounded-[14px] border border-white/80 bg-white/90 px-3.5 py-3 shadow-[0_16px_40px_#382b7820] backdrop-blur-xl sm:bottom-[42px] sm:left-[-5px]">
            <span className="grid size-[31px] place-items-center rounded-[10px] bg-[#e6f7ef] text-sm font-extrabold text-[#40a57a]">
              ✓
            </span>
            <span>
              <strong className="block text-[9px] text-[#454a64]">Made for your journey</strong>
              <small className="mt-1 block text-[8px] text-[#9a9eb0]">
                Guidance that moves with you
              </small>
            </span>
          </div>
          <span className="absolute left-[12%] top-[15%] text-xl text-[#a59aee]">✦</span>
          <span className="absolute bottom-[18%] right-[12%] text-[27px] text-[#a59aee]">✧</span>
        </div>
      </section>

      <section className="relative z-[1] border-t border-[#ebe8f4] py-[58px] sm:py-20 lg:pb-[88px]" id="features">
        <div className="text-center">
          <span className="text-[9px] font-extrabold tracking-[1.5px] text-[#6958d6]">
            A LITTLE HELP GOES A LONG WAY
          </span>
          <h2 className="mt-3.5 text-[clamp(26px,3vw,36px)] font-bold tracking-[-1.5px]">
            Your career, with a clearer view.
          </h2>
          <p className="mt-2.5 text-xs text-[#727994]">
            Start with what you know. We’ll help you see where it could take you.
          </p>
        </div>
        <div className="mt-[29px] grid grid-cols-1 gap-[17px] sm:mt-[39px] lg:grid-cols-3">
          {features.map((feature) => (
            <article
              className="group relative min-h-[170px] rounded-[18px] border border-[#eceaf4] bg-white/80 p-[23px] shadow-[0_8px_26px_#28214e05] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#dcd5fa] hover:bg-white hover:shadow-[0_18px_38px_#28214e12] lg:min-h-[190px]"
              key={feature.title}
            >
              <span
                className={`grid size-[38px] place-items-center rounded-xl text-[17px] ${feature.color}`}
              >
                {feature.icon}
              </span>
              <h3 className="mb-2 mt-[17px] text-sm font-bold">{feature.title}</h3>
              <p className="m-0 max-w-[260px] text-[11px] leading-[1.7] text-[#727994]">
                {feature.description}
              </p>
              <a
                className="absolute bottom-5 right-[21px] text-xs text-[#aaa3cf]"
                href="#about"
                aria-label={`Learn more: ${feature.title}`}
              >
                <LandingIcon name="arrow" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <footer
        className="flex min-h-20 flex-wrap items-center justify-between gap-5 border-t border-[#ececf4] py-5 text-[10px] text-[#969aad]"
        id="about"
      >
        <a
          className="inline-flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-1px] text-[#1e2440]"
          href="#home"
        >
          <span className="grid size-[27px] place-items-center rounded-[9px] bg-gradient-to-br from-[#8d7cf0] to-[#6352ce] text-[13px] text-white">
            <LandingIcon name="star" />
          </span>
          <span>
            career<span className="text-[#6958d6]">mate</span>
          </span>
        </a>
        <span className="max-sm:order-3 max-sm:w-full">
          Thoughtful tools for wherever you’re headed.
        </span>
        <HealthStatus />
      </footer>
    </main>
  );
}
