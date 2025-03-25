"use client";
import { splitName } from "@/utils";
import { useUpdateUserDetails } from "../../../../../hooks/useUpdateUserDetails";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import useUserData, { UserData } from "@/hooks/useUserData";
import { log } from "@/utils/sentryUtils";

// Update the types to be more specific
interface EditProfileModalProps {
  profileId: string; // ID of the profile being edited
  closeAction: () => void;
}

export default function EditProfileModal({
  profileId,
  closeAction,
}: EditProfileModalProps) {
  // Get both the authenticated user and the profile data
  const { user: authUser } = useUser();
  const { data: profileData, updateUserDataOptimistically } =
    useUserData(profileId);

  // Get update functions
  const { updateViewedProfile, throttledUpdateUser } = useUpdateUserDetails();

  // State for form fields - using the original UI's state structure
  const [firstname, setFirstName] = useState<string>(
    splitName(profileData?.full_name || "").firstName
  );
  const [lastname, setLastName] = useState<string>(
    splitName(profileData?.full_name || "").lastName
  );
  const [full_name, setFullName] = useState<string>(
    profileData?.full_name || ""
  );
  const [bio, setBio] = useState<string>(profileData?.bio || "");
  const [displayName, setDisplayName] = useState<string>(
    profileData?.display_name || profileData?.username || ""
  );
  const [email] = useState<string>(authUser?.email || "");

  // Update local state when profile data changes
  useEffect(() => {
    if (profileData) {
      const { firstName, lastName } = splitName(profileData.full_name || "");
      setFirstName(firstName);
      setLastName(lastName);
      setFullName(profileData.full_name || "");
      setBio(profileData.bio || "");
      setDisplayName(profileData.display_name || profileData.username || "");
      log("Updated display name from profile data", {
        displayName: profileData.display_name || profileData.username || "",
      });
    }
  }, [profileData]);

  // Update full name when first/last name changes
  useEffect(() => {
    if (firstname || lastname) setFullName(`${firstname} ${lastname}`);
    else setFullName("");
  }, [firstname, lastname]);

  // Modify the handleSave function to preserve existing data
  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    if (!profileId) {
      toast.error("Cannot update profile: User ID is missing");
      return;
    }

    log("Profile update initiated", {
      full_name,
      displayName,
    });

    if (!full_name || !displayName) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Log current profile data for debugging
    log("Current profile data before update", { profileData });

    // Only include the fields we're actually changing
    // Important: display_name should be used for the API, not username
    const updates: Partial<UserData> = {
      full_name,
      bio,
      display_name: displayName, // This is correct - we send display_name to the API
    };

    // Log what we're sending for debugging
    log("Sending profile updates", updates);

    // Optimistically update the UI - preserve existing fields
    updateUserDataOptimistically(updates);

    // Update the profile with only the changed fields
    updateViewedProfile(profileId, updates);

    closeAction();
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
              src={profileData?.avatar_url || "/profile.jpg"}
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
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />
        </div>

        <div>
          <label className="mb-1 block">Last Name</label>

          <input
            className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none text-primary-5 placeholder:text-primary-7 indent-4"
            type="text"
            placeholder="Doe"
            value={lastname}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />
        </div>

        <div className="col-span-2">
          <label className="text-primary-4 mb-1 block">Display name</label>

          <input
            className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none text-primary-5 placeholder:text-primary-7 indent-4"
            type="text"
            placeholder="Jon Doe"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
            }}
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
            placeholder="Enter your bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
            }}
          />
        </div>

        <div className="rounded-2xl flex items-center justify-end col-span-2 space-x-5">
          <button
            onClick={closeAction}
            type="button"
            className="cursor-pointer transition duration-300 hover:scale-105 px-8 py-3 rounded-full border-[1px] border-primary-10 text-primary-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary-1 text-black font-semibold cursor-pointer transition duration-300 hover:scale-105 px-8 py-3 rounded-full"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
