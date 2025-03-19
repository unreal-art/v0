"use client";
import { splitName } from "@/utils";
import { useUpdateUserDetails } from "../../../../../hooks/useUpdateUserDetails";
import Image from "next/image";
import {
  FormEvent,
  ReactEventHandler,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import useUserData from "@/hooks/useUserData";

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
    splitName(profileData?.full_name || "").firstName,
  );
  const [lastname, setLastName] = useState<string>(
    splitName(profileData?.full_name || "").lastName,
  );
  const [full_name, setFullName] = useState<string>(
    profileData?.full_name || "",
  );
  const [bio, setBio] = useState<string>(profileData?.bio || "");
  const [displayName, setDisplayName] = useState<string>(
    profileData?.username || profileData?.display_name || "",
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
      console.log(
        "Updated display name from profile data:",
        profileData.display_name || profileData.username || "",
      );
    }
  }, [profileData]);

  // Update full name when first/last name changes
  useEffect(() => {
    if (firstname || lastname) setFullName(`${firstname} ${lastname}`);
    else setFullName("");
  }, [firstname, lastname]);

  // Modify the handleFieldChange function to ensure display_name is preserved
  // const handleFieldChange = useCallback(
  //   (field: string, value: string) => {
  //     console.log(`Field change: ${field} = ${value}`);

  //     // Create the update object
  //     let updateData: any = {};

  //     // Handle special case for first/last name
  //     if (field === "firstname" || field === "lastname") {
  //       console.log("First/Last name change detected");

  //       // For name updates, we only want to update full_name
  //       field = "full_name";
  //       value = full_name;
  //       updateData[field] = value;

  //       // CRITICAL: Always include the current display_name in the update
  //       // to prevent it from being lost during first/last name updates
  //       if (profileData?.display_name) {
  //         console.log(
  //           "Explicitly including display_name during name update:",
  //           profileData.display_name
  //         );
  //         updateData.display_name = profileData.display_name;
  //       } else if (displayName) {
  //         console.log("Using current displayName state:", displayName);
  //         updateData.display_name = displayName;
  //       }
  //     } else if (field === "display_name") {
  //       // When directly updating display_name, update both fields
  //       updateData.display_name = value;
  //       updateData.username = value; // Keep username in sync for UI
  //     } else {
  //       // For regular field updates
  //       updateData[field] = value;
  //     }

  //     console.log("Sending update:", updateData);

  //     // Use throttled update when typing in fields
  //     if (profileId) {
  //       // Optimistically update the UI - but preserve existing fields
  //       updateUserDataOptimistically(updateData);

  //       // Use throttled update to reduce API calls - only update the specific field
  //       throttledUpdateUser(profileId, updateData);
  //     }
  //   },
  //   [
  //     throttledUpdateUser,
  //     profileId,
  //     full_name,
  //     updateUserDataOptimistically,
  //     profileData,
  //     displayName,
  //   ]
  // );

  // Modify the handleSave function to preserve existing data
  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    if (!profileId) {
      toast.error("Cannot update profile: User ID is missing");
      return;
    }

    console.log("Full name:", full_name, "Display name:", displayName);

    if (!full_name || !displayName) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Log current profile data for debugging
    console.log("Current profile data:", profileData);

    // Only include the fields we're actually changing
    // Important: display_name should be used for the API, not username
    const updates = {
      full_name,
      bio,
      display_name: displayName, // This is correct - we send display_name to the API
    };

    // Log what we're sending for debugging
    console.log("Sending updates:", updates);

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
              // handleFieldChange("firstname", e.target.value);
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
              // handleFieldChange("lastname", e.target.value);
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
              // handleFieldChange("display_name", e.target.value);
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
            placeholder="Write about yourself"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              // handleFieldChange("bio", e.target.value);
            }}
          />
        </div>

        <div className="flex justify-end h-12 mb-4 mt-8 text-primary-6 gap-4 col-span-2">
          <button
            onClick={closeAction}
            className="border-primary-10 w-40 border-[1px] rounded-full"
            type="button"
          >
            Cancel
          </button>

          <button
            className="bg-primary-10 w-40 rounded-full text-primary-3 disabled:bg-primary-11 disabled:text-primary-9"
            type="submit"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
