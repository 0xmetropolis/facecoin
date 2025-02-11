"use client";

import { Avatar } from "./avatar";
import { useUser } from "@/lib/queries/user";

export const ClientSideAvatar = ({ userId }: { userId?: number }) => {
  const { data: user } = useUser({ id: userId });

  return <Avatar user={user} />;
};
