"use client";
import Link from "next/link";
import { Button } from "../ui/button";

interface BackButtonProps {
  label?: string;
  href: string;
  desc?: string;
}

export const BackButton = ({ label, href, desc }: BackButtonProps) => {
  return (
    <Button
      variant="link"
      className="underline underline-offset-4"
      asChild
      size={"sm"}
    >
      <Link href={href} className="">
        {desc} {label}
      </Link>
    </Button>
  );
};
