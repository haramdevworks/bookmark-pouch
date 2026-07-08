import { getUserProfile } from "@/lib/auth";

export async function UserProfile() {
  let profile = null;
  let error = false;

  try {
    profile = await getUserProfile();
  } catch {
    error = true;
  }

  if (error || !profile) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5">
      {profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatarUrl}
          alt={profile.displayName || profile.email}
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {profile.displayName?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {profile.displayName && (
          <p className="text-[12px] font-semibold text-foreground truncate">
            {profile.displayName}
          </p>
        )}
        <p className="text-[11px] text-description truncate">
          {profile.email}
        </p>
      </div>
    </div>
  );
}
