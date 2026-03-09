import { useState, useEffect, useRef, useCallback } from 'react'

const IMG_VOLCANO = 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80'
const IMG_RAFTING = 'https://images.unsplash.com/photo-1530866495561-507c83cee4ca?w=800&q=80'
const IMG_CANOPY = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'
const IMG_KAYAK = 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&q=80'
const IMG_HORSE = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80'
const IMG_LAKE = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80'
const IMG_FOREST = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80'
const IMG_MOUNTAIN = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
const IMG_SUNSET = 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80'
const IMG_RIVER = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'
const IMG_TRAIL = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'
const IMG_CAMP = 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80'
const IMG_SNOW = 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80'
const IMG_SPA = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'

export const companies = [
  {
    name: 'Volcán Villarrica Expediciones',
    images: [IMG_KAYAK, IMG_CANOPY, IMG_VOLCANO],
    subcategories: ['Volcanes', 'Trekking', 'Aventura'],
    description: 'Somos líderes en ascensos al volcán Villarrica con más de 15 años de experiencia. Nuestros guías certificados te acompañan en una aventura única hacia la cumbre del volcán más activo de Sudamérica. Incluimos equipamiento completo, transporte y seguro.',
    rating: 4.9,
    location: 'Pucón, Araucanía',
    detailImage: IMG_VOLCANO,
    detailDescription: 'Volcán Villarrica Expediciones nació en 2008 con la misión de acercar a las personas a la majestuosidad del volcán Villarrica de forma segura y responsable. Contamos con un equipo de 12 guías certificados internacionalmente, equipamiento de última generación y protocolos de seguridad que superan los estándares de la industria. Cada ascenso es una experiencia transformadora que te conecta con la naturaleza en su máxima expresión.',
    collage: [
      [IMG_VOLCANO, IMG_MOUNTAIN, IMG_SNOW, IMG_TRAIL],
      [IMG_KAYAK, IMG_LAKE, IMG_SUNSET, IMG_CANOPY],
      [IMG_FOREST, IMG_RIVER, IMG_CAMP, IMG_HORSE],
    ],
    detailImage2: IMG_MOUNTAIN,
    detailDescription2: 'Nuestros tours incluyen recogida en tu alojamiento, desayuno energético, equipamiento completo (crampones, piolet, casco, polainas), guía bilingüe y certificado de cumbre. La experiencia dura aproximadamente 8 horas y es apta para personas con buena condición física desde los 15 años.',
    address: 'Av. O\'Higgins 535, Pucón',
    phone: '+56 9 8765 4321',
    email: 'info@volcanexpediciones.cl',
    schedule: 'Lunes a Domingo: 06:00 - 20:00',
    tours: [
      { name: 'Ascenso Volcán Villarrica', days: 'Lunes, Miércoles, Viernes y Sábado', hora: '06:00 AM', precio: '$85.000' },
      { name: 'Trekking Glaciar', days: 'Martes y Jueves', hora: '07:00 AM', precio: '$45.000' },
      { name: 'Tour Cuevas Volcánicas', days: 'Todos los días', hora: '10:00 AM y 15:00 PM', precio: '$35.000' },
      { name: 'Noche de Estrellas en el Volcán', days: 'Viernes y Sábado', hora: '20:00 PM', precio: '$55.000' },
    ],
  },
  {
    name: 'Trancura Rafting Aventura',
    images: [IMG_VOLCANO, IMG_KAYAK, IMG_CANOPY],
    subcategories: ['Rafting', 'Aventura', 'Nocturno'],
    description: 'Vive la adrenalina del rafting en el río Trancura con recorridos de clase III y IV. Ideal para familias y grupos de amigos. Contamos con equipos de última generación, fotógrafo en cada salida y guías bilingües con certificación internacional.',
    rating: 4.8,
    location: 'Río Trancura, Pucón',
    detailImage: IMG_VOLCANO,
    detailDescription: 'Trancura Rafting Aventura lleva más de 10 años ofreciendo la mejor experiencia de rafting en la región de la Araucanía. Nuestro río Trancura ofrece tramos de clase III ideales para familias y clase IV para los más aventureros. Cada balsa es guiada por profesionales con certificación IRF y llevamos fotógrafo en cada salida para que no pierdas ningún momento.',
    collage: [
      [IMG_RIVER, IMG_RAFTING, IMG_LAKE, IMG_KAYAK],
      [IMG_SUNSET, IMG_TRAIL, IMG_FOREST, IMG_MOUNTAIN],
      [IMG_CAMP, IMG_VOLCANO, IMG_SNOW, IMG_CANOPY],
    ],
    detailImage2: IMG_MOUNTAIN,
    detailDescription2: 'Ofrecemos distintos niveles de dificultad para que toda la familia pueda disfrutar. El tramo bajo es perfecto para niños desde 6 años y principiantes, mientras que el tramo alto desafía incluso a los más experimentados. Incluimos traje de neopreno, casco, chaleco salvavidas y transporte.',
    address: 'Camino Trancura Km 8, Pucón',
    phone: '+56 9 7654 3210',
    email: 'reservas@trancurarafting.cl',
    schedule: 'Lunes a Domingo: 08:00 - 18:00',
    tours: [
      { name: 'Rafting Tramo Bajo (Clase III)', days: 'Todos los días', hora: '09:00 AM y 14:00 PM', precio: '$35.000' },
      { name: 'Rafting Tramo Alto (Clase IV)', days: 'Lunes, Miércoles, Viernes y Sábado', hora: '10:00 AM', precio: '$50.000' },
      { name: 'Kayak Río Trancura', days: 'Martes, Jueves y Sábado', hora: '09:00 AM', precio: '$40.000' },
      { name: 'Rafting Nocturno', days: 'Viernes y Sábado', hora: '19:00 PM', precio: '$60.000' },
    ],
  },
  {
    name: 'Termas del Bosque Nativo',
    images: [IMG_CANOPY, IMG_VOLCANO, IMG_KAYAK],
    subcategories: ['Termas', 'Spa', 'Trekking', 'Gastronomía'],
    description: 'Relájate en nuestras piscinas termales rodeadas de bosque nativo milenario. Ofrecemos circuito de aguas calientes y frías, masajes terapéuticos, aromaterapia y gastronomía local. Un refugio de paz en el corazón de la Araucanía.',
    rating: 5.0,
    location: 'Coñaripe, Araucanía',
    detailImage: IMG_VOLCANO,
    detailDescription: 'Termas del Bosque Nativo es un santuario de bienestar enclavado en medio de un bosque milenario de araucarias y coigües. Nuestras aguas termales brotan naturalmente a 42°C directamente de la tierra volcánica, ricas en minerales que benefician la piel y la salud. Un lugar donde el tiempo se detiene y la naturaleza te abraza.',
    collage: [
      [IMG_LAKE, IMG_SPA, IMG_SUNSET, IMG_FOREST],
      [IMG_MOUNTAIN, IMG_TRAIL, IMG_CAMP, IMG_RIVER],
      [IMG_HORSE, IMG_SNOW, IMG_VOLCANO, IMG_RAFTING],
    ],
    detailImage2: IMG_MOUNTAIN,
    detailDescription2: 'Contamos con 8 piscinas de diferentes temperaturas, senderos interpretativos por el bosque nativo, zona de barro volcánico, sauna natural y un restaurant con cocina basada en ingredientes locales. Nuestro spa ofrece masajes descontracturantes, piedras calientes y aromaterapia.',
    address: 'Camino Termas Km 32, Coñaripe',
    phone: '+56 9 6543 2109',
    email: 'reservas@termasbosquenativo.cl',
    schedule: 'Lunes a Domingo: 09:00 - 21:00',
    tours: [
      { name: 'Circuito Termal Full Day', days: 'Todos los días', hora: '09:00 AM a 21:00 PM', precio: '$28.000' },
      { name: 'Spa + Masaje Relajante', days: 'Lunes a Sábado', hora: '10:00 AM y 15:00 PM', precio: '$55.000' },
      { name: 'Cena Termal bajo las Estrellas', days: 'Viernes y Sábado', hora: '19:30 PM', precio: '$45.000' },
      { name: 'Trekking + Termas', days: 'Martes, Jueves y Domingo', hora: '08:00 AM', precio: '$38.000' },
    ],
  },
  {
    name: 'Canopy Bosque Aventura',
    images: [IMG_KAYAK, IMG_VOLCANO, IMG_CANOPY],
    subcategories: ['Aventura', 'Naturaleza', 'Nocturno'],
    description: 'Recorre 11 plataformas de canopy sobre el bosque nativo con vistas espectaculares al volcán Villarrica. Circuitos para todos los niveles, desde principiantes hasta expertos. Actividad segura apta desde los 6 años.',
    rating: 4.7,
    location: 'Huilo-Huilo, Araucanía',
    detailImage: IMG_VOLCANO,
    detailDescription: 'Canopy Bosque Aventura te invita a volar sobre las copas de los árboles centenarios del bosque valdiviano. Nuestro circuito de 11 plataformas y 1.5 km de cables te ofrece una perspectiva única del bosque nativo, con vistas panorámicas al volcán Villarrica y los lagos de la región. Seguridad de clase mundial con equipos europeos certificados.',
    collage: [
      [IMG_TRAIL, IMG_CANOPY, IMG_MOUNTAIN, IMG_FOREST],
      [IMG_RIVER, IMG_SNOW, IMG_LAKE, IMG_SUNSET],
      [IMG_KAYAK, IMG_HORSE, IMG_RAFTING, IMG_CAMP],
    ],
    detailImage2: IMG_MOUNTAIN,
    detailDescription2: 'Ofrecemos tres circuitos: el familiar (6 plataformas, ideal para niños), el clásico (11 plataformas) y el extremo (con salto pendular y tirolesa de 300m). Todos incluyen equipamiento completo, charla de seguridad y guías certificados. Duración aproximada entre 1.5 y 3 horas según el circuito.',
    address: 'Ruta 199 Km 55, Huilo-Huilo',
    phone: '+56 9 5432 1098',
    email: 'info@canopybosque.cl',
    schedule: 'Martes a Domingo: 09:00 - 17:00',
    tours: [
      { name: 'Circuito Familiar (6 plataformas)', days: 'Martes a Domingo', hora: '10:00 AM y 14:00 PM', precio: '$25.000' },
      { name: 'Circuito Clásico (11 plataformas)', days: 'Martes a Domingo', hora: '09:00 AM, 12:00 PM y 15:00 PM', precio: '$40.000' },
      { name: 'Circuito Extremo + Salto Pendular', days: 'Jueves, Sábado y Domingo', hora: '10:00 AM', precio: '$55.000' },
      { name: 'Canopy Nocturno con Linternas', days: 'Viernes y Sábado', hora: '20:00 PM', precio: '$50.000' },
    ],
  },
  {
    name: 'Kayak Lago Villarrica',
    images: [IMG_VOLCANO, IMG_CANOPY, IMG_KAYAK],
    subcategories: ['Lagos', 'Aventura', 'Naturaleza'],
    description: 'Explora las aguas cristalinas del lago Villarrica en kayak. Ofrecemos tours guiados al amanecer y atardecer, clases para principiantes y arriendo de equipos. Descubre playas escondidas y rincones únicos del lago.',
    rating: 4.6,
    location: 'Lago Villarrica, Pucón',
    detailImage: IMG_VOLCANO,
    detailDescription: 'Kayak Lago Villarrica te ofrece la forma más tranquila y auténtica de explorar el lago. Desde nuestras embarcaciones podrás admirar el volcán Villarrica reflejado en las aguas cristalinas, descubrir playas vírgenes accesibles solo por agua y observar la fauna nativa en su hábitat natural.',
    collage: [
      [IMG_SUNSET, IMG_KAYAK, IMG_RIVER, IMG_LAKE],
      [IMG_FOREST, IMG_VOLCANO, IMG_TRAIL, IMG_SPA],
      [IMG_SNOW, IMG_CANOPY, IMG_HORSE, IMG_MOUNTAIN],
    ],
    detailImage2: IMG_MOUNTAIN,
    detailDescription2: 'Nuestros kayaks son de última generación, estables y cómodos. Ofrecemos kayaks simples y dobles, con opción de kayak transparente para ver el fondo del lago. Todos los tours incluyen chaleco salvavidas, remo, instrucción básica y snack saludable.',
    address: 'Playa Grande s/n, Pucón',
    phone: '+56 9 4321 0987',
    email: 'hola@kayakvillarrica.cl',
    schedule: 'Lunes a Domingo: 07:00 - 19:00',
    tours: [
      { name: 'Tour Amanecer en el Lago', days: 'Lunes, Miércoles, Viernes y Domingo', hora: '06:30 AM', precio: '$30.000' },
      { name: 'Tour Atardecer Volcán', days: 'Todos los días', hora: '17:00 PM', precio: '$32.000' },
      { name: 'Clase de Kayak Principiantes', days: 'Martes, Jueves y Sábado', hora: '10:00 AM', precio: '$20.000' },
      { name: 'Expedición Playas Secretas', days: 'Miércoles y Sábado', hora: '09:00 AM', precio: '$45.000' },
    ],
  },
  {
    name: 'Cabalgatas Araucanía',
    images: [IMG_CANOPY, IMG_KAYAK, IMG_VOLCANO],
    subcategories: ['Cabalgatas', 'Naturaleza', 'Gastronomía'],
    description: 'Recorre senderos ancestrales a caballo por los bosques y montañas de la Araucanía. Rutas de medio día y día completo con almuerzo campestre incluido. Caballos mansos y guías con profundo conocimiento del territorio mapuche.',
    rating: 4.8,
    location: 'Villarrica, Araucanía',
    detailImage: IMG_VOLCANO,
    detailDescription: 'Cabalgatas Araucanía nació del amor por los caballos y la tierra mapuche. Nuestras rutas recorren senderos ancestrales utilizados por el pueblo mapuche durante siglos, atravesando bosques de araucarias milenarias, ríos cristalinos y praderas con vistas panorámicas al volcán. Una experiencia que conecta con la historia y la naturaleza.',
    collage: [
      [IMG_CAMP, IMG_HORSE, IMG_MOUNTAIN, IMG_TRAIL],
      [IMG_VOLCANO, IMG_RIVER, IMG_SUNSET, IMG_LAKE],
      [IMG_CANOPY, IMG_RAFTING, IMG_FOREST, IMG_SPA],
    ],
    detailImage2: IMG_MOUNTAIN,
    detailDescription2: 'Contamos con 20 caballos mansos y bien cuidados, aptos para jinetes de todos los niveles. Nuestros guías son descendientes mapuche que comparten historias y tradiciones durante el recorrido. Los tours de día completo incluyen almuerzo campestre con productos locales y asado al disco.',
    address: 'Camino Villarrica-Lican Ray Km 5',
    phone: '+56 9 3210 9876',
    email: 'contacto@cabalgatasaraucania.cl',
    schedule: 'Martes a Domingo: 08:00 - 18:00',
    tours: [
      { name: 'Cabalgata Medio Día', days: 'Martes a Domingo', hora: '09:00 AM y 14:00 PM', precio: '$35.000' },
      { name: 'Cabalgata Día Completo + Almuerzo', days: 'Miércoles, Viernes y Domingo', hora: '09:00 AM', precio: '$65.000' },
      { name: 'Cabalgata Atardecer', days: 'Martes, Jueves y Sábado', hora: '16:00 PM', precio: '$30.000' },
      { name: 'Ruta Mapuche Ancestral (2 días)', days: 'Sábado', hora: '08:00 AM', precio: '$120.000' },
    ],
  },
  {
    name: 'Spa Termal Pucón',
    images: [IMG_KAYAK, IMG_CANOPY, IMG_VOLCANO],
    subcategories: ['Spa', 'Termas', 'Gastronomía', 'Nocturno'],
    description: 'Centro termal premium con piscinas naturales de agua volcánica. Circuitos de hidroterapia, sauna, barro volcánico y masajes relajantes. Disfruta de nuestro restaurant con vista panorámica al volcán y al lago.',
    rating: 4.9,
    location: 'Pucón, Araucanía',
    detailImage: IMG_VOLCANO,
    detailDescription: 'Spa Termal Pucón es el centro de bienestar más exclusivo de la región. Nuestras instalaciones combinan la arquitectura moderna con elementos naturales de la zona, creando un ambiente de lujo y relajación total. Las aguas termales volcánicas son nuestra joya, con propiedades curativas reconocidas por siglos.',
    collage: [
      [IMG_FOREST, IMG_SUNSET, IMG_SPA, IMG_LAKE],
      [IMG_CAMP, IMG_KAYAK, IMG_MOUNTAIN, IMG_RIVER],
      [IMG_RAFTING, IMG_TRAIL, IMG_SNOW, IMG_HORSE],
    ],
    detailImage2: IMG_MOUNTAIN,
    detailDescription2: 'Nuestro centro cuenta con 6 piscinas termales, circuito de contrastes, sauna finlandesa, baño turco, zona de barro volcánico, sala de relajación y restaurant gourmet. Ofrecemos paquetes individuales, en pareja y grupales. Reserva anticipada recomendada en temporada alta.',
    address: 'Camino Pucón-Huife Km 12',
    phone: '+56 9 2109 8765',
    email: 'spa@termalpucon.cl',
    schedule: 'Lunes a Domingo: 10:00 - 22:00',
    tours: [
      { name: 'Circuito Termal Clásico', days: 'Todos los días', hora: '10:00 AM a 22:00 PM', precio: '$32.000' },
      { name: 'Pack Pareja Romántico', days: 'Todos los días', hora: '11:00 AM y 16:00 PM', precio: '$90.000' },
      { name: 'Sesión Barro Volcánico + Masaje', days: 'Lunes a Sábado', hora: '10:00 AM, 13:00 PM y 16:00 PM', precio: '$48.000' },
      { name: 'Cena Gourmet + Termas Nocturnas', days: 'Jueves a Sábado', hora: '19:00 PM', precio: '$65.000' },
    ],
  },
]

const fanAngles = [
  { rotate: -15, translateX: -50 },
  { rotate: 0, translateX: 0 },
  { rotate: 15, translateX: 50 },
]

function CardFan({ images }) {
  return (
    <div className="relative shrink-0" style={{ width: '250px', height: '180px' }}>
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute w-28 h-[150px] rounded-xl overflow-hidden shadow-2xl border-[3px] border-white transition-transform duration-300 hover:scale-110 hover:z-20"
          style={{
            transform: `translateX(calc(-50% + ${fanAngles[i].translateX}px)) rotate(${fanAngles[i].rotate}deg)`,
            transformOrigin: 'bottom center',
            left: '50%',
            top: '0px',
            zIndex: i === 1 || i === 2 ? 12 : 10,
          }}
        >
          <img src={img} alt="Turismo" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}

function FloatingButton({ label, icon, onClick }) {
  const [bottom, setBottom] = useState(24)

  useEffect(() => {
    let rafId
    const handleScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const footer = document.querySelector('footer')
        if (!footer) return

        const footerTop = footer.getBoundingClientRect().top
        const windowHeight = window.innerHeight
        const visibleFooter = windowHeight - footerTop

        if (visibleFooter > 0) {
          setBottom(visibleFooter + 16)
        } else {
          setBottom(24)
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ bottom: `${bottom}px` }}>
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-accent text-primary px-6 py-2.5 rounded-full shadow-lg hover:brightness-110 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wide"
      >
        <span className="material-symbols-outlined text-base">{icon}</span>
        {label}
      </button>
    </div>
  )
}

function CollageCard({ images }) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-xl overflow-hidden h-48">
      {images.map((img, i) => (
        <img key={i} src={img} alt="Galería" className="w-full h-full object-cover" />
      ))}
    </div>
  )
}

function CompanyDetail({ company, onBack }) {
  return (
    <div className="flex flex-col gap-8 relative pb-16">
      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-accent rounded-full"></div>
        <h2 className="text-lg font-bold text-slate-700 tracking-wide">{company.name}</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* Fila 1: Imagen izquierda + Texto derecho */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="md:w-1/2 rounded-xl overflow-hidden shadow-md">
          <img src={company.detailImage} alt={company.name} className="w-full h-64 object-cover" />
        </div>
        <div className="md:w-1/2 flex flex-col">
          <h3 className="text-sm font-black text-primary mb-2">Sobre Nosotros</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{company.detailDescription}</p>
        </div>
      </div>

      {/* Fila 2: Tres collages de 4 fotos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {company.collage.map((imgs, i) => (
          <CollageCard key={i} images={imgs} />
        ))}
      </div>

      {/* Fila 3: Texto izquierdo + Imagen derecha */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="md:w-1/2 flex flex-col">
          <h3 className="text-sm font-black text-primary mb-2">Nuestra Experiencia</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{company.detailDescription2}</p>
        </div>
        <div className="md:w-1/2 rounded-xl overflow-hidden shadow-md">
          <img src={company.detailImage2} alt={company.name} className="w-full h-64 object-cover" />
        </div>
      </div>

      {/* Fila 4: Datos de la empresa + Panoramas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos empresa */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 pl-8">
          <h3 className="text-sm font-black text-primary mb-4">Datos de la Empresa</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-base">location_on</span>
              <span className="text-xs text-slate-600">{company.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-base">call</span>
              <span className="text-xs text-slate-600">{company.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-base">mail</span>
              <span className="text-xs text-slate-600">{company.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-base">schedule</span>
              <span className="text-xs text-slate-600">{company.schedule}</span>
            </div>

            {/* Contáctanos */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-black text-accent mb-3 uppercase tracking-widest">¡Ubícanos!</h4>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:scale-110 transition-transform" title="Facebook">
                  <svg className="w-7 h-7 fill-current text-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="hover:scale-110 transition-transform" title="Instagram">
                  <svg className="w-7 h-7" viewBox="0 0 24 24"><defs><linearGradient id="ig-detail" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style={{stopColor:'#feda75'}}/><stop offset="25%" style={{stopColor:'#fa7e1e'}}/><stop offset="50%" style={{stopColor:'#d62976'}}/><stop offset="75%" style={{stopColor:'#962fbf'}}/><stop offset="100%" style={{stopColor:'#4f5bd5'}}/></linearGradient></defs><path fill="url(#ig-detail)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="hover:scale-110 transition-transform" title="YouTube">
                  <svg className="w-7 h-7 fill-current text-[#FF0000]" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Panoramas / Tours */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-black text-primary mb-4">Panoramas y Salidas</h3>
          <div className="flex flex-col gap-3">
            {company.tours.map((tour, i) => (
              <div key={i} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-slate-700">{tour.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-accent text-xs">calendar_today</span>
                    <span className="text-[10px] text-slate-500">{tour.days}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-accent text-xs">schedule</span>
                    <span className="text-[10px] text-slate-500">{tour.hora}</span>
                  </div>
                  <span className="text-xs font-black text-primary">{tour.precio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón flotante volver */}
      <FloatingButton label="Volver a Turismo" icon="arrow_back" onClick={onBack} />
    </div>
  )
}

export default function TourismPage({ activeFilter, onClearFilter }) {
  const [selectedCompany, setSelectedCompany] = useState(null)

  useEffect(() => {
    if (activeFilter) {
      setSelectedCompany(null)
    }
  }, [activeFilter])

  const filteredCompanies = activeFilter
    ? companies.filter((c) => c.subcategories.includes(activeFilter))
    : companies

  if (selectedCompany) {
    return (
      <CompanyDetail
        company={selectedCompany}
        onBack={() => {
          setSelectedCompany(null)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-6 bg-accent rounded-full"></div>
        <h2 className="text-lg font-bold text-slate-700 tracking-wide">
          {activeFilter ? `Turismo — ${activeFilter}` : 'Turismo y Experiencias en Villarrica'}
        </h2>
        {activeFilter && (
          <span className="text-[10px] text-slate-400">{filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}</span>
        )}
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {filteredCompanies.length === 0 && (
        <p className="text-center text-slate-400 text-xs mt-8">No hay empresas con esta actividad.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCompanies.map((company) => (
          <div
            key={company.name}
            className="flex flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100 p-5 gap-4 items-center"
          >
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">location_on</span>
                <span className="text-[10px] font-bold text-slate-400">{company.location}</span>
              </div>
              <h3 className="text-lg font-black text-primary mb-1">{company.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">{company.description}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCompany(company)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="bg-primary hover:bg-primary-light text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-105 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Ver más
                </button>
                <button className="border border-primary/20 text-primary px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-primary/5 transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">call</span>
                  Contactar
                </button>
              </div>
            </div>

            <div className="shrink-0">
              <CardFan images={company.images} />
            </div>
          </div>
        ))}
      </div>

      {activeFilter && onClearFilter && (
        <FloatingButton label="Quitar filtro" icon="close" onClick={onClearFilter} />
      )}
    </div>
  )
}
