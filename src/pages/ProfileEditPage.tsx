import { Camera } from 'lucide-react';
import avatarImage from '@/assets/avatar.png';
import meditationImage from '@/assets/meditation.png';

const inputClassName =
  'h-9 rounded-sm border border-[#9ca3af] bg-muted px-3 text-sm leading-5 outline-none md:h-10 md:text-base md:leading-6';

export function ProfileEditPage() {
  return (
    <section className="min-h-[676px] md:relative">
      <h1 className="mb-4 text-2xl leading-8 md:hidden">Мой профиль</h1>

      <div className="rounded-xl bg-card p-4 shadow-card md:h-[337px] md:w-[580px]">
        <div className="mb-4 flex justify-center md:justify-start">
          <div className="relative">
            <img alt="" className="size-20 rounded-full object-cover" src={avatarImage} />
            <button className="absolute right-[-20px] bottom-0 grid size-10 place-items-center rounded-full bg-primary text-white" type="button" aria-label="Загрузить фото">
              <Camera className="size-6" />
            </button>
          </div>
        </div>

        <form className="grid gap-4 md:gap-3">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm leading-5 text-[#9ca3af]">
              <span className="md:hidden">Язык:</span>
              <span className="hidden md:inline">Имя:</span>
              <input className={inputClassName} defaultValue="Имя" />
            </label>
            <label className="grid gap-1 text-sm leading-5 text-[#9ca3af]">
              Фамилия:
              <input className={inputClassName} defaultValue="Фамилия:" />
            </label>
          </div>

          <label className="grid gap-1 text-sm leading-5 text-[#9ca3af] md:w-[258px]">
            Email:
            <input className={inputClassName} defaultValue="Email@yanex.ru" />
          </label>

          <div className="mt-4 grid gap-4 md:mt-3 md:flex md:gap-2">
            <button className="h-9 rounded-md border border-primary bg-card px-4 text-sm leading-5 font-bold text-primary md:h-10 md:text-base md:leading-6" type="button">
              Отменить
            </button>
            <button className="h-9 rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white md:h-10 md:w-40 md:text-base md:leading-6" type="button">
              Сохранить
            </button>
          </div>
        </form>
      </div>

      <img
        alt=""
        className="pointer-events-none absolute right-[99px] bottom-0 hidden h-[574px] w-[574px] object-contain md:block"
        src={meditationImage}
      />
    </section>
  );
}
