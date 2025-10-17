"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SEND_MESSAGE_MUTATION } from "@/lib/graphql/message-operations";
import { IconMessage } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "urql";

interface StartMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "order" | "sample" | "collection";
  itemId: number;
  itemTitle: string;
  receiverId: number;
  receiverName: string;
}

export function StartMessageModal({
  open,
  onOpenChange,
  type,
  itemId,
  itemTitle,
  receiverId,
  receiverName,
}: StartMessageModalProps) {
  const [message, setMessage] = useState("");
  const [, sendMessage] = useMutation(SEND_MESSAGE_MUTATION);
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Lütfen bir mesaj yazın");
      return;
    }

    setIsSending(true);

    const input: any = {
      content: message,
      type: type,
      receiverId: receiverId,
    };

    if (type === "order") {
      input.orderId = itemId;
    } else if (type === "sample") {
      input.sampleId = itemId;
    }

    const result = await sendMessage({ input });

    setIsSending(false);

    if (result.error) {
      toast.error("Mesaj gönderilemedi: " + result.error.message);
      return;
    }

    toast.success("Mesaj gönderildi!");
    setMessage("");
    onOpenChange(false);

    // Redirect to messages page
    router.push("/dashboard/messages");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconMessage className="h-5 w-5" />
            Mesaj Gönder
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{itemTitle}</span> hakkında{" "}
            <span className="font-medium">{receiverName}</span> ile mesajlaşmaya başlayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mesajınız</Label>
            <Textarea
              id="message"
              placeholder={`${itemTitle} hakkında mesajınızı yazın...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={isSending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            İptal
          </Button>
          <Button onClick={handleSend} disabled={isSending || !message.trim()}>
            {isSending ? "Gönderiliyor..." : "Gönder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
