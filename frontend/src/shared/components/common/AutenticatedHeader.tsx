"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import type { getAuthClient } from "@/infra/auth/auth-client";
import { signOutFederatedSession } from "@/infra/auth/auth-session";
import type { InstitutesType } from "@/shared/config/institutes";
import { Avatar, AvatarFallback } from "@/shared/shadcn/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/shadcn/components/ui/dropdown-menu";

type AuthSession = NonNullable<
  ReturnType<ReturnType<typeof getAuthClient>["useSession"]>["data"]
>;

interface AutenticatedHeaderProps {
  institute: InstitutesType;
  session: AuthSession;
}

export function AutenticatedHeader({ institute, session }: AutenticatedHeaderProps) {
  const userInfo = session?.user;
  const initials = userInfo?.name
    ? userInfo.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n.charAt(0)?.toUpperCase() || "")
        .join("") || "NA"
    : "NA";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus:outline-none rounded-full transition-all hover:scale-105"
        >
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userInfo?.name || "Usuario"}
            </p>
            {userInfo?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {userInfo.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${institute}/perfil`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOutFederatedSession({ institute })}
          className="cursor-pointer"
          role="button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
