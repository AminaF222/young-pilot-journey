type Props = { defaultSrc: string };

export default function AminaPhoto({ defaultSrc }: Props) {
  return (
    <div className="amina-photo-block">
      <aside
        className="amina-photo-placeholder amina-photo-with-image"
        aria-label="Amina’s portrait"
        data-testid="story-photo-placeholder"
      >
        <img
          className="amina-photo-image"
          src={defaultSrc}
          alt="Amina wearing a white pilot shirt in front of an airplane"
          width={934}
          height={1024}
          loading="lazy"
          decoding="async"
          data-testid="story-photo-image"
        />
      </aside>
    </div>
  );
}
