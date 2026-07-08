import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function UserProfile() {
  let email = null;
  let displayName = null;
  let avatarUrl = null;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle errors silently
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      email = user.email;
      displayName = user.user_metadata?.name || email.split("@")[0];
      avatarUrl = user.user_metadata?.avatar_url;
    }
  } catch {
    // Silently fail - just won't show profile
  }

  if (!email) {
    return null;
  }

  const initials = displayName?.[0]?.toUpperCase() || email[0].toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={displayName || email}
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {displayName && (
          <p className="text-[12px] font-semibold text-foreground truncate">
            {displayName}
          </p>
        )}
        <p className="text-[11px] text-description truncate">
          {email}
        </p>
      </div>
    </div>
  );
}
