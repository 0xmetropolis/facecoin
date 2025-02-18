import Image from "next/image";

export const Profile = ({ pfp }: { pfp: string }) => {
  return (
    <div className="flex flex-col gap-2 w-[60px]">
      <div className="relative aspect-square">
        <Image
          fill
          alt="pfp"
          quality={10}
          className="rounded-full aspect-square object-cover"
          priority
          placeholder="blur"
          blurDataURL="/facebook-avatar.webp"
          src={`${pfp}`}
        />
      </div>
    </div>
  );
};
