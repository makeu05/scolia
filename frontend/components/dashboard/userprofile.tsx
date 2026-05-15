"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  name?: string;
  role?: string;
  avatar?: string;
};

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function getInitials(name?: string) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="flex items-center gap-3">
      {/* Texte */}
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-foreground">
          {user?.name || "Utilisateur"}
        </p>
        <p className="text-xs text-muted-foreground">
          {user?.role || "Utilisateur"}
        </p>
      </div>

      {/* Avatar */}
      <Avatar className="size-9">
        <AvatarImage src={user?.avatar || "/avatar.jpg"} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(user?.name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}