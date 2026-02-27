import Image from "next/image";

type CardProps = {
  title: string;
  children: React.ReactNode;
  image?: { src: string; alt: string };
  className?: string;
};

export function Card({ title, children, image, className = "" }: CardProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {image && (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="mb-3 text-xl font-bold text-foreground">{title}</h3>
        {children}
      </div>
    </div>
  );
}
