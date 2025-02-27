"use client";

import { resetUserAction } from "@/actions";
import { useActionState } from "react";
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";

export const ResetBadUsersForm = () => {
  const [state, formAction, isPending] = useActionState<
    { error: string | null; success: string | null },
    FormData
  >(resetUserAction, { error: null, success: null });

  return (
    <div className="container max-w-2xl py-8 bg-slate-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Admin - Reset Users</h1>
      <form action={formAction} className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          {state.success && <p className="text-green-500">{state.success}</p>}
          {state.error && <p className="text-red-500">{state.error}</p>}
          <label htmlFor="socialHandle">Social Handle</label>
          <Input id="socialHandle" type="text" name="socialHandle" />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Resetting..." : "Reset"}
        </Button>
      </form>
    </div>
  );
};
