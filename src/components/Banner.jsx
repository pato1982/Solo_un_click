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

function Slide1() {
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[260px] flex items-stretch">
      {/* Fondo diagonal */}
      <div className="absolute inset-0" style={{ backgroundColor: '#F2D860' }}></div>
      <div className="absolute inset-0" style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 55% 100%)', backgroundColor: '#F5F4F7' }}></div>

      {/* Textura sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Tarjetas flotantes zona izquierda (fondo amarillo) */}
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

      {/* Contenido izquierdo */}
      <div className="relative z-10 flex-[0_0_28%] p-6 pl-8 flex flex-col justify-center">
        <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Solo a un Click te ofrece</p>
        <h3 className="text-3xl md:text-4xl font-black text-primary leading-[0.95] tracking-tight">
          TU VITRINA<br />DIGITAL
        </h3>
        <p className="text-primary/50 text-[10px] font-bold mt-3 max-w-[220px] leading-relaxed">
          Sube tus productos, gestiónalos desde tu panel y muéstralos a miles de personas en Villarrica. Podrás hacerlo de forma gratuita con uno de nuestros planes 100% gratis.
        </p>
      </div>

      {/* Centro - cartas en abanico */}
      <div className="relative z-20 flex-[0_0_38%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '10px' }}>
        <div className="relative pointer-events-auto" style={{ width: '300px', height: '200px' }}>
          {fanCards1.map((card, i) => (
            <div
              key={i}
              className="absolute w-28 h-[150px] rounded-xl overflow-hidden shadow-2xl border-[3px] border-white transition-transform duration-300 hover:scale-110"
              style={{
                transform: `translateX(calc(-50% + ${card.translateX}px)) rotate(${card.rotate}deg)`,
                transformOrigin: 'bottom center',
                left: '50%',
                top: '20px',
                zIndex: 10 + (i === 2 ? 5 : i > 2 ? 4 - i : i),
              }}
            >
              <img src={card.image} alt="Producto" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 z-30">
            <div className="w-12 h-12 bg-white rounded-lg shadow-2xl flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-300 ring-2 ring-accent/30">
              <span className="material-symbols-outlined text-primary text-xl">ads_click</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido derecho - Beneficios en 2 columnas */}
      <div className="relative z-10 flex-[0_0_34%] p-5 pl-2 pr-4 flex flex-col justify-center">
        <p className="text-primary/50 text-sm font-black uppercase tracking-[0.2em] mb-3">¿Por qué publicar aquí?</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">storefront</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Tienda online gratis</p>
              <p className="text-slate-500 text-[10px] leading-tight">Publica sin costo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">groups</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Cientos de compradores</p>
              <p className="text-slate-500 text-[10px] leading-tight">Buscan a diario en Villarrica</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">bolt</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Rápido y simple</p>
              <p className="text-slate-500 text-[10px] leading-tight">Sube productos en minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">phone_in_talk</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Contacto directo</p>
              <p className="text-slate-500 text-[10px] leading-tight">WhatsApp, llamada o visita</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">verified</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Fácil de gestionar</p>
              <p className="text-slate-500 text-[10px] leading-tight">Panel simple e intuitivo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">location_on</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Cerca de ti</p>
              <p className="text-slate-500 text-[10px] leading-tight">Negocios de tu zona</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">schedule</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Visible 24/7</p>
              <p className="text-slate-500 text-[10px] leading-tight">Tu vitrina nunca cierra</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            </div>
            <div>
              <p className="text-slate-800 text-[11px] font-black leading-tight">Aumenta tus ventas</p>
              <p className="text-slate-500 text-[10px] leading-tight">Más exposición, más clientes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Slide2() {
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[260px] flex items-stretch">
      {/* Fondo diagonal invertido: blanco izq, amarillo der */}
      <div className="absolute inset-0" style={{ backgroundColor: '#F5F4F7' }}></div>
      <div className="absolute inset-0" style={{ clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 55% 100%)', backgroundColor: '#F2D860' }}></div>

      {/* Textura sutil */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Tarjetas flotantes zona derecha (fondo amarillo) */}
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

      {/* Contenido izquierdo - Compra segura */}
      <div className="relative z-10 flex-[0_0_28%] p-6 pl-8 flex flex-col justify-center">
        <p className="text-primary/60 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Compra con seguridad</p>
        <h3 className="text-3xl md:text-4xl font-black text-primary leading-[0.95] tracking-tight">
          CONOCE<br />ANTES DE<br />COMPRAR
        </h3>
        <p className="text-slate-500 text-[10px] font-bold mt-3 max-w-[220px] leading-relaxed">
          No transfieras dinero sin antes conocer el local, la persona o el producto. Visita, pregunta y confirma antes de pagar.
        </p>
      </div>

      {/* Centro - cartas en abanico turismo */}
      <div className="relative z-20 flex-[0_0_38%] flex items-start justify-center pointer-events-none" style={{ paddingTop: '10px' }}>
        <div className="relative pointer-events-auto" style={{ width: '300px', height: '200px' }}>
          {fanCards2.map((card, i) => (
            <div
              key={i}
              className="absolute w-28 h-[150px] rounded-xl overflow-hidden shadow-2xl border-[3px] border-accent transition-transform duration-300 hover:scale-110"
              style={{
                transform: `translateX(calc(-50% + ${card.translateX}px)) rotate(${card.rotate}deg)`,
                transformOrigin: 'bottom center',
                left: '50%',
                top: '20px',
                zIndex: 10 + (i === 2 ? 5 : i > 2 ? 4 - i : i),
              }}
            >
              <img src={card.image} alt="Turismo" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 z-30">
            <div className="w-12 h-12 bg-accent rounded-lg shadow-2xl flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-300 ring-2 ring-primary/30">
              <span className="material-symbols-outlined text-primary text-xl">shield</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido derecho - Seguridad de datos */}
      <div className="relative z-10 flex-[0_0_34%] p-5 pl-2 pr-4 flex flex-col justify-center">
        <p className="text-primary/80 text-sm font-black uppercase tracking-[0.2em] mb-3">Tu seguridad es primero</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">lock</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">Datos protegidos</p>
              <p className="text-primary/50 text-[10px] leading-tight">Tu info está segura</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">visibility</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">Verifica el vendedor</p>
              <p className="text-primary/50 text-[10px] leading-tight">Conoce antes de pagar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">block</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">No transfieras a ciegas</p>
              <p className="text-primary/50 text-[10px] leading-tight">Confirma el producto</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">storefront</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">Visita el local</p>
              <p className="text-primary/50 text-[10px] leading-tight">Compra presencialmente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">report</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">Reporta fraudes</p>
              <p className="text-primary/50 text-[10px] leading-tight">Ayúdanos a cuidarnos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">privacy_tip</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">Sin datos a terceros</p>
              <p className="text-primary/50 text-[10px] leading-tight">No compartimos tu info</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">contact_phone</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">Contacto real</p>
              <p className="text-primary/50 text-[10px] leading-tight">Habla directo con el dueño</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
            </div>
            <div>
              <p className="text-primary text-[11px] font-black leading-tight">Comunidad segura</p>
              <p className="text-primary/50 text-[10px] leading-tight">Comercio local confiable</p>
            </div>
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
      <div className="relative overflow-hidden rounded-2xl min-h-[260px]">
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
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-primary' : 'w-1.5 bg-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
