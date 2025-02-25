"use client";

import { pokeAction } from "@/actions";
import { useActionState, useEffect } from "react";
import { Button } from "../shadcn/button";
import { toast } from "@/lib/hooks/use-toast";

export const PokeButton = ({
  victim,
  children,
}: {
  victim: number;
  children: React.ReactNode;
}) => {
  const [state, formAction] = useActionState<
    { error: null | string; success: null | string },
    FormData
  >(pokeAction, { error: null, success: null });

  useEffect(() => {
    if (state.error) {
      toast({
        title: "Error",
        description: state.error,
      });
    }
  }, [state.error]);
  console.log(state);
  return (
    <form action={formAction} className="flex flex-col gap-2 items-center">
      <input type="hidden" name="victim" value={victim} />
      {state.success ? (
        <p className="whitespace-nowrap text-gray-500 font-medium text-sm">{state.success}</p>
      ) : (
        <Button
          type="submit"
          className="text-sm px-2.5 w-auto"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {children}
        </Button>
      )}
      {state.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
};
