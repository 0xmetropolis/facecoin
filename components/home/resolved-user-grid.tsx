"use client";

import { User } from "@/lib/types";
import { Avatar } from "../avatar/avatar";
import Providers from "../providers/providers";

export const ResolvedUserGrid = async ({ users }: { users: User[] }) => {
  return (
    <Providers>
      {users.map((user: User) => (
        <Avatar key={user.id} user={user} />
      ))}
    </Providers>
  );
};
