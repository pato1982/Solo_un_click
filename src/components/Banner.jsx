import { useState, useEffect } from 'react'

const IMG_CHAIR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtgS0SetPDa0pDvV-eKE4m0aK2J26dGm6gy0M1dUy-G-2N8exAFgxYVFOAGSShBaD66dYz7ydh-e1ItrO_e6xFTkR3HvtDNCMGzoJmSmMudDH2ZcBcooUxMd9XR7PvWEv-ZDD49kJEGKEzqL8YBnHk7Ptxn6gOTb3ey2EmoHHKPnA9Ny8Z1Zv81SsfQObaMoIzx2GMNjcSTnzjPWgTyETTnwU7p2calL-ZMBcXvos9_TL0H8_0UPntrurqNg5dqTI55A7SmoHnTj0'
const IMG_DESK = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA38oJjJWEUBdLOIOQn9-ZxX3k5SCbkc4Qz5vzl_TvRayDl6FbSIk974zdMpQHY145ZG6vD5Deq91Iw971LdVWrB82pl5fcMHV1NkALb7zk7w4BW01tQaAl-WoH1QeXsEQ0Cmp66PkIWPi8F94bKz3nWIaUE6HSaV2gFyvju4fVBDt88fM3RXq2g02EkG7bnmi3f8pEORPEGACVIgj4zaC2nSW0BU6DuM1-frKn2Bymil3ID2Qj1yNEFzpsZsS6MqCFQwnVkcMnINg'
const IMG_LAPTOP = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzR7ViSyn9C9Zd0jUBxTS__s2kzDNB8GsK8FsGYMv4aAvpcMMKD6OZscTI77gCTqSw6J68F17xDAcfsg1kiCKEJ9KAIgjnPZDPpa21o2TIhUKVp-K9m8s7haZfTBPOCeyirQGhSkEnwjiw7H_I2y9zsn4RSgYFeKVU7yN1u4w4BCrLjXet-S4btobWZ7reoQ4DQuaP2Ioet3EBEgj3tjyjO8AvW-VyHDj1v9UBMwwwzzZJiRKUeRs4Z62LltzVtV4QmoHamCw5U'

const IMG_VOLCANO = 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80'
const IMG_CANOPY = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
const IMG_KAYAK = 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&q=80'

const fanCards1 = [
  { image: IMG_CHAIR, rotate: -28, translateX: -70 },
  { image: IMG_DESK, rotate: -14, translateX: -35 },
  { image: IMG_LAPTOP, rotate: 0, translateX: 0 },
  { image: IMG_CHAIR, rotate: 14, translateX: 35 },
  { image: IMG_DESK, rotate: 28, translateX: 70 },
]

const fanCards2 = [
  { image: IMG_KAYAK, rotate: -28, translateX: -70 },
  { image: IMG_CANOPY, rotate: -14, translateX: -35 },
  { image: IMG_VOLCANO, rotate: 0, translateX: 0 },
  { image: IMG_KAYAK, rotate: 14, translateX: 35 },
  { image: IMG_CANOPY, rotate: 28, translateX: 70 },
]

// Versión mobile/tablet de las cartas en abanico (3 cartas, más pequeñas)
const fanCards1Small = [
  { image: IMG_DESK, rotate: -18, translateX: -40 },
  { image: IMG_LAPTOP, rotate: 0, translateX: 0 },
  { image: IMG_CHAIR, rotate: 18, translateX: 40 },
]

const fanCards2Small = [
  { image: IMG_CANOPY, rotate: -18, translateX: -40 },
  { image: IMG_VOLCANO, rotate: 0, translateX: 0 },
  { image: IMG_KAYAK, rotate: 18, translateX: 40 },
]

function FanCards({ cards, cardsSmall, borderColor = 'border-white' }) {
  return (
    <>
      {/* Desktop: 5 cartas */}
      <div className="hidden md:block relative pointer-events-auto" style={{ width: '300px', height: '200px' }}>
        {cards.map((card, i) => (
          <div
            key={i}
            className={`absolute w-28 h-[150px] rounded-xl overflow-hidden shadow-2xl ${borderColor} border-[3px] transition-transform duration-300 hover:scale-110`}
            style={{
              transform: `translateX(calc(-50% + ${card.translateX}px)) rotate(${card.rotate}deg)`,
              transformOrigin: 'bottom center',
              left: '50%',
              top: '20px',
              zIndex: 10 + (i === 2 ? 5 : i > 2 ? 4 - i : i),
            }}
          >
            <img src={card.image} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {/* Tablet: 3 cartas medianas */}
      <div className="hidden sm:block md:hidden relative pointer-events-auto" style={{ width: '200px', height: '150px' }}>
        {cardsSmall.map((card, i) => (
          <div
            key={i}
            className={`absolute w-20 h-[110px] rounded-lg overflow-hidden shadow-xl ${borderColor} border-2 transition-transform duration-300 hover:scale-110`}
            style={{
              transform: `translateX(calc(-50% + ${card.translateX}px)) rotate(${card.rotate}deg)`,
              transformOrigin: 'bottom center',
              left: '50%',
              top: '10px',
              zIndex: 10 + (i === 1 ? 5 : i),
            }}
          >
            <img src={card.image} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {/* Mobile: 3 cartas pequeñas */}
      <div className="sm:hidden relative pointer-events-auto" style={{ width: '160px', height: '120px' }}>
        {cardsSmall.map((card, i) => (
          <div
            key={i}
            className={`absolute w-16 h-[85px] rounded-lg overflow-hidden shadow-lg ${borderColor} border-2 transition-transform duration-300`}
            style={{
              transform: `translateX(calc(-50% + ${card.translateX * 0.7}px)) rotate(${card.rotate}deg)`,
              transformOrigin: 'bottom center',
              left: '50%',
              top: '8px',
              zIndex: 10 + (i === 1 ? 5 : i),
            }}
          >
            <img src={card.image} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </>
  )
}

function BenefitItem({ icon, title, subtitle, textColor = 'text-slate-800', subtitleColor = 'text-slate-500' }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 shrink-0 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-[10px] sm:text-xs md:text-sm">{icon}</span>
      </div>
      <div>
        <p className={`${textColor} text-[9px] sm:text-[10px] md:text-[11px] font-black leading-tight`}>{title}</p>
        <p className={`${subtitleColor} text-[8px] sm:text-[9px] md:text-[10px] leading-tight hidden sm:block`}>{subtitle}</p>
      </div>
    </div>
  )
}

function Slide1() {
  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[230px] md:min-h-[260px] flex items-stretch">
      {/* Fondo diagonal */}
      <div className="absolute inset-0" style={{ backgroundColor: '#F2D860' }}></div>
      <div className="absolute inset-0" style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 55% 100%)', backgroundColor: '#F5F4F7' }}></div>

      {/* Textura sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Tarjetas flotantes zona izquierda - solo desktop */}
      <div className="hidden md:block">
        <div className="absolute top-4 left-[2%] w-20 h-24 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] rotate-12">
          <img src={IMG_CHAIR} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-4 left-[12%] w-16 h-20 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] -rotate-6">
          <img src={IMG_LAPTOP} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-2 left-[24%] w-14 h-18 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] rotate-3">
          <img src={IMG_DESK} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-2 left-[30%] w-14 h-18 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] -rotate-6">
          <img src={IMG_DESK} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-[40%] left-[8%] w-12 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] rotate-6">
          <img src={IMG_LAPTOP} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-1 left-[34%] w-12 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] -rotate-3">
          <img src={IMG_CHAIR} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-[35%] left-[18%] w-12 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] rotate-9">
          <img src={IMG_DESK} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* === MOBILE: Layout vertical === */}
      <div className="sm:hidden relative z-10 flex flex-col items-center w-full p-4 gap-3">
        <div className="text-center">
          <p className="text-primary/60 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Solo a un Click te ofrece</p>
          <h3 className="text-2xl font-black text-primary leading-[0.95] tracking-tight">
            TU VITRINA<br />DIGITAL
          </h3>
        </div>
        <div className="flex items-start justify-center pointer-events-none">
          <FanCards cards={fanCards1} cardsSmall={fanCards1Small} borderColor="border-white" />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full mt-2">
          <BenefitItem icon="storefront" title="Tienda online gratis" subtitle="Publica sin costo" />
          <BenefitItem icon="groups" title="Cientos de compradores" subtitle="Buscan a diario" />
          <BenefitItem icon="bolt" title="Rápido y simple" subtitle="Sube en minutos" />
          <BenefitItem icon="phone_in_talk" title="Contacto directo" subtitle="WhatsApp o visita" />
        </div>
      </div>

      {/* === TABLET: Layout horizontal compacto === */}
      <div className="hidden sm:flex md:hidden relative z-10 w-full items-stretch">
        <div className="flex-[0_0_30%] p-4 flex flex-col justify-center">
          <p className="text-primary/60 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Solo a un Click te ofrece</p>
          <h3 className="text-2xl font-black text-primary leading-[0.95] tracking-tight">
            TU VITRINA<br />DIGITAL
          </h3>
          <p className="text-primary/50 text-[9px] font-bold mt-2 max-w-[180px] leading-relaxed">
            Sube tus productos, gestiónalos desde tu panel y muéstralos a miles de personas en Villarrica.
          </p>
        </div>
        <div className="flex-[0_0_30%] flex items-start justify-center pointer-events-none pt-2">
          <FanCards cards={fanCards1} cardsSmall={fanCards1Small} borderColor="border-white" />
        </div>
        <div className="flex-[0_0_40%] p-3 flex flex-col justify-center">
          <p className="text-primary/50 text-xs font-black uppercase tracking-[0.15em] mb-2">¿Por qué publicar aquí?</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <BenefitItem icon="storefront" title="Tienda online gratis" subtitle="Publica sin costo" />
            <BenefitItem icon="groups" title="Cientos de compradores" subtitle="Buscan a diario" />
            <BenefitItem icon="bolt" title="Rápido y simple" subtitle="Sube en minutos" />
            <BenefitItem icon="phone_in_talk" title="Contacto directo" subtitle="WhatsApp o visita" />
            <BenefitItem icon="verified" title="Fácil de gestionar" subtitle="Panel intuitivo" />
            <BenefitItem icon="location_on" title="Cerca de ti" subtitle="Negocios de tu zona" />
          </div>
        </div>
      </div>

      {/* === DESKTOP: Layout original === */}
      <div className="hidden md:flex relative z-10 w-full items-stretch">
        {/* Contenido izquierdo */}
        <div className="flex-[0_0_28%] p-6 pl-8 flex flex-col justify-center">
          <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Solo a un Click te ofrece</p>
          <h3 className="text-3xl md:text-4xl font-black text-primary leading-[0.95] tracking-tight">
            TU VITRINA<br />DIGITAL
          </h3>
          <p className="text-primary/50 text-[10px] font-bold mt-3 max-w-[220px] leading-relaxed">
            Sube tus productos, gestiónalos desde tu panel y muéstralos a miles de personas en Villarrica. Podrás hacerlo de forma gratuita con uno de nuestros planes 100% gratis.
          </p>
        </div>

        {/* Centro - cartas en abanico */}
        <div className="flex-[0_0_38%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '10px' }}>
          <div className="relative pointer-events-auto z-20">
            <FanCards cards={fanCards1} cardsSmall={fanCards1Small} borderColor="border-white" />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 z-30">
              <div className="w-12 h-12 bg-white rounded-lg shadow-2xl flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-300 ring-2 ring-accent/30">
                <span className="material-symbols-outlined text-primary text-xl">ads_click</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido derecho - Beneficios en 2 columnas */}
        <div className="flex-[0_0_34%] p-5 pl-2 pr-4 flex flex-col justify-center">
          <p className="text-primary/50 text-sm font-black uppercase tracking-[0.2em] mb-3">¿Por qué publicar aquí?</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <BenefitItem icon="storefront" title="Tienda online gratis" subtitle="Publica sin costo" />
            <BenefitItem icon="groups" title="Cientos de compradores" subtitle="Buscan a diario en Villarrica" />
            <BenefitItem icon="bolt" title="Rápido y simple" subtitle="Sube productos en minutos" />
            <BenefitItem icon="phone_in_talk" title="Contacto directo" subtitle="WhatsApp, llamada o visita" />
            <BenefitItem icon="verified" title="Fácil de gestionar" subtitle="Panel simple e intuitivo" />
            <BenefitItem icon="location_on" title="Cerca de ti" subtitle="Negocios de tu zona" />
            <BenefitItem icon="schedule" title="Visible 24/7" subtitle="Tu vitrina nunca cierra" />
            <BenefitItem icon="trending_up" title="Aumenta tus ventas" subtitle="Más exposición, más clientes" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Slide2() {
  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[230px] md:min-h-[260px] flex items-stretch">
      {/* Fondo diagonal invertido */}
      <div className="absolute inset-0" style={{ backgroundColor: '#F5F4F7' }}></div>
      <div className="absolute inset-0" style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 55% 100%)', backgroundColor: '#F2D860' }}></div>

      {/* Textura sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Tarjetas flotantes zona derecha - solo desktop */}
      <div className="hidden md:block">
        <div className="absolute top-4 right-[2%] w-20 h-24 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] -rotate-12">
          <img src={IMG_VOLCANO} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-4 right-[12%] w-16 h-20 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] rotate-6">
          <img src={IMG_KAYAK} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-2 right-[24%] w-14 h-18 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] -rotate-3">
          <img src={IMG_CANOPY} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-2 right-[30%] w-14 h-18 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] rotate-6">
          <img src={IMG_VOLCANO} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-[40%] right-[8%] w-12 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] -rotate-6">
          <img src={IMG_KAYAK} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-1 right-[34%] w-12 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] rotate-3">
          <img src={IMG_CANOPY} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-[35%] right-[18%] w-12 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white opacity-[0.12] -rotate-9">
          <img src={IMG_VOLCANO} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* === MOBILE: Layout vertical === */}
      <div className="sm:hidden relative z-10 flex flex-col items-center w-full p-4 gap-3">
        <div className="text-center">
          <p className="text-primary/60 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Compra con seguridad</p>
          <h3 className="text-2xl font-black text-primary leading-[0.95] tracking-tight">
            CONOCE<br />ANTES DE<br />COMPRAR
          </h3>
        </div>
        <div className="flex items-start justify-center pointer-events-none">
          <FanCards cards={fanCards2} cardsSmall={fanCards2Small} borderColor="border-accent" />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full mt-2">
          <BenefitItem icon="lock" title="Datos protegidos" subtitle="Tu info segura" textColor="text-primary" subtitleColor="text-primary/50" />
          <BenefitItem icon="visibility" title="Verifica el vendedor" subtitle="Conoce antes de pagar" textColor="text-primary" subtitleColor="text-primary/50" />
          <BenefitItem icon="block" title="No transfieras a ciegas" subtitle="Confirma el producto" textColor="text-primary" subtitleColor="text-primary/50" />
          <BenefitItem icon="storefront" title="Visita el local" subtitle="Compra presencial" textColor="text-primary" subtitleColor="text-primary/50" />
        </div>
      </div>

      {/* === TABLET: Layout horizontal compacto === */}
      <div className="hidden sm:flex md:hidden relative z-10 w-full items-stretch">
        <div className="flex-[0_0_30%] p-4 flex flex-col justify-center">
          <p className="text-primary/60 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Compra con seguridad</p>
          <h3 className="text-2xl font-black text-primary leading-[0.95] tracking-tight">
            CONOCE<br />ANTES DE<br />COMPRAR
          </h3>
          <p className="text-slate-500 text-[9px] font-bold mt-2 max-w-[180px] leading-relaxed">
            No transfieras dinero sin antes conocer el local, la persona o el producto.
          </p>
        </div>
        <div className="flex-[0_0_30%] flex items-start justify-center pointer-events-none pt-2">
          <FanCards cards={fanCards2} cardsSmall={fanCards2Small} borderColor="border-accent" />
        </div>
        <div className="flex-[0_0_40%] p-3 flex flex-col justify-center">
          <p className="text-primary/80 text-xs font-black uppercase tracking-[0.15em] mb-2">Tu seguridad es primero</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <BenefitItem icon="lock" title="Datos protegidos" subtitle="Tu info segura" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="visibility" title="Verifica el vendedor" subtitle="Conoce antes de pagar" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="block" title="No transfieras a ciegas" subtitle="Confirma el producto" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="storefront" title="Visita el local" subtitle="Compra presencial" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="report" title="Reporta fraudes" subtitle="Ayúdanos a cuidarnos" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="privacy_tip" title="Sin datos a terceros" subtitle="No compartimos tu info" textColor="text-primary" subtitleColor="text-primary/50" />
          </div>
        </div>
      </div>

      {/* === DESKTOP: Layout original === */}
      <div className="hidden md:flex relative z-10 w-full items-stretch">
        {/* Contenido izquierdo - Compra segura */}
        <div className="flex-[0_0_28%] p-6 pl-8 flex flex-col justify-center">
          <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Compra con seguridad</p>
          <h3 className="text-3xl md:text-4xl font-black text-primary leading-[0.95] tracking-tight">
            CONOCE<br />ANTES DE<br />COMPRAR
          </h3>
          <p className="text-slate-500 text-[10px] font-bold mt-3 max-w-[220px] leading-relaxed">
            No transfieras dinero sin antes conocer el local, la persona o el producto. Visita, pregunta y confirma antes de pagar.
          </p>
        </div>

        {/* Centro - cartas en abanico turismo */}
        <div className="flex-[0_0_38%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '10px' }}>
          <div className="relative pointer-events-auto z-20">
            <FanCards cards={fanCards2} cardsSmall={fanCards2Small} borderColor="border-accent" />
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 z-30">
              <div className="w-12 h-12 bg-accent rounded-lg shadow-2xl flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-300 ring-2 ring-primary/30">
                <span className="material-symbols-outlined text-primary text-xl">shield</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido derecho - Seguridad de datos */}
        <div className="flex-[0_0_34%] p-5 pl-2 pr-4 flex flex-col justify-center">
          <p className="text-primary/80 text-sm font-black uppercase tracking-[0.2em] mb-3">Tu seguridad es primero</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <BenefitItem icon="lock" title="Datos protegidos" subtitle="Tu info está segura" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="visibility" title="Verifica el vendedor" subtitle="Conoce antes de pagar" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="block" title="No transfieras a ciegas" subtitle="Confirma el producto" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="storefront" title="Visita el local" subtitle="Compra presencialmente" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="report" title="Reporta fraudes" subtitle="Ayúdanos a cuidarnos" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="privacy_tip" title="Sin datos a terceros" subtitle="No compartimos tu info" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="contact_phone" title="Contacto real" subtitle="Habla directo con el dueño" textColor="text-primary" subtitleColor="text-primary/50" />
            <BenefitItem icon="verified_user" title="Comunidad segura" subtitle="Comercio local confiable" textColor="text-primary" subtitleColor="text-primary/50" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Banner() {
  const [current, setCurrent] = useState(0)
  const slides = [Slide1, Slide2]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl min-h-[200px] sm:min-h-[230px] md:min-h-[260px]">
        {slides.map((SlideComponent, i) => (
          <div
            key={i}
            className={`transition-opacity duration-1000 ease-in-out ${
              i === 0 ? 'relative' : 'absolute inset-0'
            } ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <SlideComponent />
          </div>
        ))}
      </div>
      {/* Indicadores */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-5 sm:w-6 bg-primary' : 'w-1.5 bg-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
