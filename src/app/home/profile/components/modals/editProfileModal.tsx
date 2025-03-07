import { splitName } from "@/utils";
import { useUpdateUserDetails } from "@/hooks/useUpdateUserDetails";
import Image from "next/image";
import { FormEvent, ReactEventHandler, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditProfileModal({
  user,
  close,
}: {
  user: any;
  close: () => void;
}) {
  const updateUser = useUpdateUserDetails();

  const [firstname, setFirstName] = useState<string>(
    splitName(user.full_name).firstName
  );
  const [lastname, setLastName] = useState<string>(
    splitName(user.full_name).lastName
  );
  const [full_name, setFullName] = useState<string>(user.full_name);
  const [bio, setBio] = useState<string>(user.bio);
  const [displayName, setDisplayName] = useState<string>(user.username);
  const [email] = useState<string>(user.email);

  useEffect(() => {
    if (firstname || lastname) setFullName(`${firstname} ${lastname}`);
    else setFullName("");
  }, [firstname, lastname]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    console.log(full_name, bio, displayName);
    if (!full_name || !displayName) {
      toast.error("Please fill in all fields.");
      return;
    }

    const data = {
      full_name,
      bio,
      display_name: displayName,
    };
    updateUser.mutate(
      { user: data, id: user.id },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully.");
          close();
        },
        onError: (error) =>
          toast.error("Opps an error occured during profile update."),
      }
    );
  };
  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={handleSave}
        className="grid grid-cols-2 gap-5 text-primary-8 text-sm"
      >
        <div className="col-span-2 py-3 border-b-[1px] border-primary-9">
          <label className="mb-2 block text-primary-2">Profile photo</label>
          <div>
            <Image
              className="rounded-full"
              src={user?.avatar_url || "/profile.jpg"}
              width={80}
              height={80}
              alt=""
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block">First Name</label>

          <input
            className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none text-primary-5 placeholder:text-primary-7 indent-4"
            type="text"
            placeholder="Jon"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block">Last Name</label>

          <input
            className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none text-primary-5 placeholder:text-primary-7 indent-4"
            type="text"
            placeholder="Doe"
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-primary-4 mb-1 block">Display name</label>

          <input
            className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none text-primary-5 placeholder:text-primary-7 indent-4"
            type="text"
            placeholder="Jon Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block">Email Address</label>

          <input
            className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none text-primary-5 placeholder:text-primary-7 indent-4"
            type="text"
            placeholder="Jondoe@gmail.com"
            readOnly
            value={email}
          />
        </div>

        <div className="col-span-2">
          <label className="text-primary-4 mb-1 block">Bio</label>

          <input
            className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none text-primary-5 placeholder:text-primary-7 indent-4"
            type="text"
            placeholder="Write about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="flex justify-end h-12 mb-4 mt-8 text-primary-6 gap-4 col-span-2">
          <button
            onClick={close}
            className="border-primary-10 w-40 border-[1px] rounded-full"
          >
            Cancel
          </button>

          <button
            className="bg-primary-10 w-40 rounded-full text-primary-3 disabled:bg-primary-11 disabled:text-primary-9"
            // disabled={!full_name || !displayName}
            type="submit"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
