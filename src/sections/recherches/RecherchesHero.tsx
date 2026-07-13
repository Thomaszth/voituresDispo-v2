export function RecherchesHero() {
  return (
    <section
      className="w-full px-6 py-[72px] md:px-6 md:py-[100px]"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <p
          className="font-jost uppercase anim-init animate-fade-up animate-delay-100"
          style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#9A9A9A' }}
        >
          RECHERCHES EN COURS
        </p>
        <h1
          className="font-cormorant font-light text-white mt-4 anim-init animate-fade-up animate-delay-200"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
        >
          Nos clients cherchent. Avez-vous le véhicule qu'il nous faut ?
        </h1>
        <div
          className="mx-auto mt-7 anim-init animate-fade-up animate-delay-300"
          style={{ width: '60px', height: '1px', background: '#444' }}
        />
        <p
          className="font-jost font-light mt-7 anim-init animate-fade-up animate-delay-400"
          style={{ fontSize: '14px', color: '#9A9A9A', letterSpacing: '0.04em' }}
        >
          Si vous possédez l'un de ces véhicules et souhaitez le vendre, contactez-nous directement.
        </p>
      </div>
    </section>
  );
}
