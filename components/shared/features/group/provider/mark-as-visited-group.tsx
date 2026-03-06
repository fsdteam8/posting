"use client";
import { useMarkAsVisitedGroup } from "@/hooks/features/groups/api/visit/use-mark-as-visited-group";
import { useEffect } from "react";

interface Props {
  groupUserName: string;
  accessToken: string;
}

export function MarkAsVisitedGroup({ groupUserName, accessToken }: Props) {
  const { mutate } = useMarkAsVisitedGroup({ groupUserName, accessToken });

  useEffect(() => {
    mutate();
  }, [groupUserName, mutate]);

  return null;
}
