import { Camera } from "lucide-react";
import { useState, useEffect, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import avatarImage from "@/assets/avatar.png";
import { cn } from "@/lib/utils";
import {
  getFieldErrors,
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validation";
import { useUpdateProfileMutation } from "@/store/api";
import { selectCurrentUser } from "@/store/authSlice";
import type { User } from "@/types";

const inputClassName =
  "h-9 rounded-sm border border-[#9ca3af] bg-muted px-3 text-sm leading-5 outline-none md:h-10 md:text-base md:leading-6";
const errorInputClassName =
  "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20";

function getProfileErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "string") {
      return data;
    }
  }

  return "Не удалось сохранить профиль. Попробуйте ещё раз.";
}

export function ProfileEditPage() {
  const user = useSelector(selectCurrentUser);

  return <ProfileEditForm key={user?.id ?? "empty-profile"} user={user} />;
}

function ProfileEditForm({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formMessage, setFormMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const defaultValues: ProfileFormValues = {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  };
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ProfileFormValues>({
    defaultValues,
  });

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const clearFieldState = (field: keyof ProfileFormValues) => {
    clearErrors(field);
    setSuccessMessage("");
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarPreview((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      return URL.createObjectURL(file);
    });

    // todo не реализована отправка на бэк
  };

  const handleCancel = () => {
    reset(defaultValues);
    setFormMessage("");
    setSuccessMessage("");
    navigate("/profile");
  };

  const submitForm: SubmitHandler<ProfileFormValues> = async (values) => {
    setFormMessage("");
    setSuccessMessage("");

    const validationResult = profileSchema.safeParse(values);

    if (!validationResult.success) {
      const validationErrors = getFieldErrors(validationResult.error);

      if (validationErrors.firstName) {
        setError("firstName", { message: validationErrors.firstName });
      }

      if (validationErrors.lastName) {
        setError("lastName", { message: validationErrors.lastName });
      }

      if (validationErrors.email) {
        setError("email", { message: validationErrors.email });
      }

      return;
    }

    try {
      await updateProfile(validationResult.data).unwrap();
      setSuccessMessage("Профиль сохранён");
      toast.success("Профиль сохранён");
    } catch (error) {
      setFormMessage(getProfileErrorMessage(error));
    }
  };

  return (
    <section className="min-h-[800] md:relative">
      <h1 className="mb-4 text-2xl leading-8 md:hidden">Мой профиль</h1>

      <div className="rounded-xl bg-card p-4 shadow-card md:h-[337px] md:w-[580px]">
        <div className="mb-4 flex justify-center md:justify-start">
          <div className="relative">
            <img
              alt=""
              className="size-20 rounded-full object-cover"
              src={avatarPreview ?? avatarImage}
            />
            <label className="absolute right-[-20px] bottom-0 grid size-10 cursor-pointer place-items-center rounded-full bg-primary text-white">
              <Camera aria-hidden className="size-6" />
              <input
                accept="image/*"
                aria-label="Загрузить фото"
                className="sr-only"
                onChange={handleAvatarChange}
                type="file"
              />
            </label>
          </div>
        </div>

        <form
          className="grid gap-4 md:gap-3"
          noValidate
          onSubmit={handleSubmit(submitForm)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm leading-5 text-[#9ca3af]">
              <span>Имя: *</span>
              <input
                aria-label="Имя"
                aria-invalid={Boolean(errors.firstName)}
                className={cn(
                  inputClassName,
                  errors.firstName && errorInputClassName,
                )}
                {...register("firstName", {
                  onChange: () => clearFieldState("firstName"),
                })}
              />
              {errors.firstName?.message ? (
                <span className="text-xs leading-4 text-danger">
                  {errors.firstName.message}
                </span>
              ) : null}
            </label>
            <label className="grid gap-1 text-sm leading-5 text-[#9ca3af]">
              Фамилия: *
              <input
                aria-label="Фамилия"
                aria-invalid={Boolean(errors.lastName)}
                className={cn(
                  inputClassName,
                  errors.lastName && errorInputClassName,
                )}
                {...register("lastName", {
                  onChange: () => clearFieldState("lastName"),
                })}
              />
              {errors.lastName?.message ? (
                <span className="text-xs leading-4 text-danger">
                  {errors.lastName.message}
                </span>
              ) : null}
            </label>
          </div>

          <label className="grid gap-1 text-sm leading-5 text-[#9ca3af] md:w-[258px]">
            Email: *
            <input
              aria-label="Email"
              aria-invalid={Boolean(errors.email)}
              className={cn(
                inputClassName,
                errors.email && errorInputClassName,
              )}
              type="email"
              {...register("email", {
                onChange: () => clearFieldState("email"),
              })}
            />
            {errors.email?.message ? (
              <span className="text-xs leading-4 text-danger">
                {errors.email.message}
              </span>
            ) : null}
          </label>

          {formMessage ? (
            <p className="text-sm leading-5 text-danger">{formMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="text-sm leading-5 text-success">{successMessage}</p>
          ) : null}

          <div className="mt-4 grid gap-4 md:mt-3 md:flex md:gap-2">
            <button
              className="h-9 rounded-md border border-primary bg-card px-4 text-sm leading-5 font-bold text-primary md:h-10 md:text-base md:leading-6"
              onClick={handleCancel}
              type="button"
            >
              Отменить
            </button>
            <button
              className="h-9 rounded-md bg-primary px-4 text-sm leading-5 font-bold text-white disabled:bg-muted disabled:text-muted-foreground md:h-10 md:w-40 md:text-base md:leading-6"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
