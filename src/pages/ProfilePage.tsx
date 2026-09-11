import { ChevronDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import avatarImage from '@/assets/avatar.png';
import meditationImage from '@/assets/meditation.png';
import { selectCurrentUser } from '@/store/authSlice';

export function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Имя Фамилия';
  const email = user?.email ?? 'Email@yanex.ru';

  return (
    <section className="min-h-[676px] md:relative">
      <h1 className="mb-4 text-2xl leading-8 md:hidden">Мой профиль</h1>

      <div className="rounded-xl bg-card p-4 shadow-card md:h-28 md:w-[580px]">
        <div className="grid gap-6 md:flex md:items-center md:justify-between md:gap-4">
          <div className="flex items-center gap-8 md:gap-4">
            <img alt="" className="size-20 rounded-full object-cover" src={avatarImage} />
            <div className="grid gap-2 text-base leading-6">
              <p>
                {fullName}
              </p>
              <p>
                {email}
              </p>
            </div>
          </div>

          <Link
            className="flex h-9 items-center justify-center rounded-md border border-primary px-4 text-sm leading-5 font-bold text-primary md:h-10 md:text-base md:leading-6"
            to="/profile/edit"
          >
            Редактировать
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:mt-4">
        <label className="grid gap-1 text-sm leading-5 text-[#9ca3af] md:w-[180px]">
          Язык:
          <button className="flex h-10 items-center justify-between rounded-sm border border-[#9ca3af] bg-card px-3 text-sm leading-5 text-foreground" type="button">
            Русский
            <ChevronDown className="size-5 text-muted-foreground" />
          </button>
        </label>

        <label className="flex items-center gap-2 text-sm leading-5">
          <span className="size-4 rounded-full border border-[#9ca3af]" />
          Уведомлять об изменении статуса заказов по email
        </label>

        <Link className="text-sm leading-5 text-primary-hover md:hidden" to="/profile/orders">
          История заказов
        </Link>
      </div>

      <img
        alt=""
        className="pointer-events-none absolute right-[99px] bottom-0 hidden h-[574px] w-[574px] object-contain md:block"
        src={meditationImage}
      />
    </section>
  );
}
