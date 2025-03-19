"use client";
import useDeleteAccount from "@/hooks/useDeleteAccount";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function DeleteModal({
  closeAction,
}: {
  closeAction: () => void;
}) {
  const { deleteAccount, loading, error } = useDeleteAccount();
  const [confirmation, setConfirmation] = useState("");
  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    if (confirmation !== "DELETE") {
      toast.error("Please enter the correct confirmation");
      return;
    }
    await deleteAccount();
    // if (result.success) {
    //   alert("Account deleted successfully");
    // } else {
    //   alert(`Error: ${result.error}`);
    // }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-primary-7 text-sm">
        Deleting your account will permanently remove your profile, credits, and
        all associated data, including your generated images and history. Any
        remaining credits will be lost, and this action is irreversible. To
        confirm, type <strong className="text-primary-5">DELETE</strong> in the
        field below.
      </p>

      <form>
        <label className="text-primary-4 mb-2 block">
          Confirm Account Deletion
        </label>

        <input
          className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none placeholder:text-primary-7 indent-4"
          type="text"
          placeholder="Enter DELETE to proceed"
          onChange={(e) => setConfirmation(e.target.value)}
        />

        <div className="flex justify-end h-12 mb-4 mt-8 text-primary-6 gap-4">
          <button
            onClick={closeAction}
            className="border-primary-10 w-40 border-[1px] rounded-full"
          >
            Cancel
          </button>

          <button
            className={`${
              confirmation !== "DELETE" ? "border-primary-10" : "bg-primary-10 "
            } w-40 rounded-full text-primary-3 disabled:bg-primary-11 disabled:text-primary-9`}
            disabled={confirmation !== "DELETE"}
            type="button"
            onClick={handleDelete}
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
}
