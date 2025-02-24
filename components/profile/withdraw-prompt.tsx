"use client";

import { Button } from "@/components/shadcn/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/shadcn/drawer";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { useToast } from "@/lib/hooks/use-toast";
import { FACECOIN_TOKEN_ADDRESS } from "@/lib/facecoin-token";
import { User } from "@/lib/types";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { encodeFunctionData, parseAbi, parseEther } from "viem";

export function WithdrawPrompt({ currentUser }: { currentUser: User | null }) {
  const { toast } = useToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { ready, sendTransaction } = usePrivy();

  const handleWithdraw = async () => {
    if (!ready || !currentUser) return;
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      await sendTransaction({
        to: FACECOIN_TOKEN_ADDRESS,
        data: encodeFunctionData({
          abi: parseAbi([
            "function transfer(address to, uint256 amount)",
            "function balanceOf(address account) view returns (uint256)",
          ]),
          functionName: "transfer",
          args: [
            walletAddress as `0x${string}`,
            parseEther(currentUser.tokenAllocation ?? "0"),
          ],
        }),
      });
      toast({
        title: "Success!",
        description: `Your tokens have been withdrawn to ${walletAddress}`,
      });
      setIsOpen(false);
      setWalletAddress("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to withdraw tokens",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary">
          Withdraw
          <ArrowRight />
        </Button>
      </DrawerTrigger>
      <DrawerContent showOverlay>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>
              Withdraw{" "}
              {currentUser?.tokenAllocation
                ? Number(currentUser.tokenAllocation).toLocaleString()
                : "0"}{" "}
              Tokens
            </DrawerTitle>
            <DrawerDescription>
              Enter the wallet address where you&apos;d like to receive your
              tokens.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              tabIndex={0}
              id="wallet-address"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="mt-2"
            />
          </div>
          <DrawerFooter>
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !walletAddress || !ready}
            >
              {isWithdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
            </Button>
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
