import Image from "next/image";

export const Profile = ({ pfp }: { pfp: string }) => {
  return (
    <div className="flex flex-col gap-2 w-[60px]">
      <div className="relative aspect-square">
        <Image
          src={pfp}
          alt="user profile picture"
          fill
          quality={20}
          className="rounded-full aspect-square object-cover"
        />
      </div>
    </div>
  );
};
