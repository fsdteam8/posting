"use client";

import { Card } from "@/components/ui/card";
import * as ResizablePanel from "@/components/ui/resizable-panel";
import { baseURL } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import SuccessCard from "./password-reset-success";
const ResetNowForm = dynamic(() => import("./reset-now"), {
  ssr: false,
});
const OTPForm = dynamic(() => import("./otp-form"), {
  ssr: false,
});
const OTPFindContainer = dynamic(() => import("./otp-find-container"), {
  ssr: false,
});
const FindAccountContainer = dynamic(() => import("./find-account-container"), {
  ssr: false,
});

interface UserState {
  name: string;
  email: string;
  avatarUrl: string;
  otp: string;
}

const FindAccountWrapper = () => {
  const [user, setUser] = useState<UserState>({
    name: "",
    email: "",
    avatarUrl: "",
    otp: "",
  });
  const [state, setState] = useState<
    "find-account" | "otp-container" | "otp" | "reset" | "success"
  >("find-account");

  const { mutate, isPending: isFindAccountPending } = useMutation({
    mutationKey: ["find-account"],
    mutationFn: (email: string) =>
      fetch(`${baseURL}/users/${email}`).then((res) => res.json()),
    onSuccess: (data: AccountFindResponse) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      // handle success
      setUser((p) => {
        return {
          ...p,
          name: data.data.firstName,
          avatarUrl: data.data.profileImage.url,
        };
      });

      setState("otp-container");
    },
    onError: (err) => {
      console.log("find-account-error", err);
      toast.error("Server Error");
    },
  });

  return (
    <Card className="w-full max-w-md border border-border shadow-lg">
      <ResizablePanel.Root value={state}>
        <ResizablePanel.Content value="find-account">
          <FindAccountContainer
            isPending={isFindAccountPending}
            onSuccess={(email: string) => {
              setUser((p) => {
                return {
                  ...p,
                  email,
                };
              });

              mutate(email);
            }}
          />
        </ResizablePanel.Content>
        <ResizablePanel.Content value="otp-container">
          <OTPFindContainer
            userEmail={user.email}
            userName={user.name}
            avatarUrl={user.avatarUrl}
            onOtpSent={() => setState("otp")}
            onReset={() => {
              setUser({
                name: "",
                email: "",
                avatarUrl: "",
                otp: "",
              });

              setState("find-account");
            }}
          />
        </ResizablePanel.Content>
        <ResizablePanel.Content value="otp">
          <OTPForm
            email={user.email}
            onVerified={(otp: string) => {
              setUser((p) => ({ ...p, otp }));
              setState("reset");
            }}
          />
        </ResizablePanel.Content>
        <ResizablePanel.Content value="reset">
          <ResetNowForm
            email={user.email}
            otp={user.otp}
            onSuccess={() => setState("success")}
          />
        </ResizablePanel.Content>
        <ResizablePanel.Content value="success">
          <SuccessCard />
        </ResizablePanel.Content>
      </ResizablePanel.Root>
    </Card>
  );
};

export default FindAccountWrapper;

interface AccountFindResponse {
  success: boolean;
  message: string;
  data: {
    profileImage: {
      url: string;
    };
    firstName: string;
  };
}
