import { useState } from 'react'
import { getStoreForProduct } from '../data/stores'

const DEFAULT_PHONE = '56912345678'

function getWhatsAppUrl(product, phone) {
  const p = phone ? phone.replace(/[\s+]/g, '') : DEFAULT_PHONE
  const msg = `Hola! Me interesa este producto:\n\n*${product.name}*\n${product.price ? `Precio: $${product.price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}` : ''}\n\n${product.image}`
  return `https://wa.me/${p}?text=${encodeURIComponent(msg)}`
}

function ProductModal({ product, hidePrice, onClose }) {
  const store = getStoreForProduct(product.id)
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button onClick={onClose} className="absolute top-2 right-2 z-10 h-6 w-6 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-slate-600 text-sm">close</span>
        </button>

        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row md:min-h-[220px]">
          {/* Imagen - lado izquierdo más grande */}
          <div className="md:w-[50%] h-44 md:h-auto shrink-0 pt-1 pr-1 pl-1 relative">
            <img
              src={product.image}
              alt={product.alt}
              className="w-full h-full object-cover rounded-tr-xl bg-slate-100"
            />
            {product.genero && (
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-bold text-slate-700 shadow-sm">{product.genero}</span>
            )}
          </div>

          {/* Info - lado derecho */}
          <div className="md:w-[50%] p-3 flex flex-col">
            {/* 1. Nombre - 2 líneas fijas */}
            <div className="min-h-[36px] flex items-start justify-center">
              <h3 className="text-sm font-black text-primary text-center line-clamp-2 leading-[18px]">
                {(() => {
                  const words = product.name.split(' ')
                  if (words.length <= 2) return product.name
                  return <>{words.slice(0, 2).join(' ')}<br />{words.slice(2).join(' ')}</>
                })()}
              </h3>
            </div>

            {/* 2. Descripción - hasta 5 líneas fijas */}
            <div className="min-h-[60px] mt-1.5">
              <p className="text-[10px] text-slate-500 leading-[12px] line-clamp-5">{product.description}</p>
            </div>

            {/* 3. Zona variable: Tallas y/o Medidas */}
            <div className="flex-1 mt-1.5 space-y-1.5">
              {product.tallas && product.tallas.seleccion?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                    Tallas {product.tallas.tipo === 'calzado' ? '(Calzado)' : product.tallas.tipo === 'ropa' ? '(Ropa)' : '(Accesorios)'}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {product.tallas.seleccion.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 border border-slate-200 rounded text-[9px] font-bold text-slate-600 hover:border-primary hover:text-primary cursor-pointer transition-colors">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && (
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Tallas</p>
                  <div className="flex gap-1 flex-wrap">
                    {product.sizes.map((size) => (
                      <span key={size} className="px-1.5 py-0.5 border border-slate-200 rounded text-[9px] font-bold text-slate-600 hover:border-primary hover:text-primary cursor-pointer transition-colors">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && (
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Colores</p>
                  <div className="flex gap-1 flex-wrap">
                    {product.colors.map((color) => (
                      <span key={color} className="px-1.5 py-0.5 border border-slate-200 rounded text-[9px] font-bold text-slate-600 hover:border-primary hover:text-primary cursor-pointer transition-colors">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.medidas && (
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Medidas</p>
                  <div className="flex gap-2">
                    {product.medidas.alto && (
                      <span className="text-[9px] text-slate-600"><span className="font-bold">Alto:</span> {product.medidas.alto}cm</span>
                    )}
                    {product.medidas.ancho && (
                      <span className="text-[9px] text-slate-600"><span className="font-bold">Ancho:</span> {product.medidas.ancho}cm</span>
                    )}
                    {product.medidas.profundidad && (
                      <span className="text-[9px] text-slate-600"><span className="font-bold">Prof:</span> {product.medidas.profundidad}cm</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Penúltima línea: Precio actual (izq) - Precio anterior (der) */}
            <div className="pt-1.5 border-t border-slate-100 mt-1.5 flex items-center justify-between">
              {!hidePrice ? (
                <>
                  <p className="text-sm font-black text-primary">
                    ${(product.price || product.precio).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                  </p>
                  {(product.originalPrice || product.precioOriginal) ? (
                    <p className="text-[10px] font-bold text-slate-400 line-through">
                      ${(product.originalPrice || product.precioOriginal).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                    </p>
                  ) : <span />}
                </>
              ) : (
                <p className="text-[10px] font-bold text-primary">Consultar precio</p>
              )}
            </div>

            {/* 5. Última línea: Iconos de contacto */}
            <div className="flex items-center justify-end pt-1.5 mt-1.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <button className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Tienda">
                  <span className="material-symbols-outlined text-sm">storefront</span>
                </button>
                <a href={getWhatsAppUrl(product, store?.phone)} target="_blank" rel="noopener noreferrer" className="h-7 w-7 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-600 flex items-center justify-center transition-all" title="WhatsApp">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.522-.809-6.236-2.164l-.436-.35-3.233 1.084 1.084-3.233-.35-.436A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                </a>
                <button className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Ubicación">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                </button>
                <button className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all" title="Teléfono">
                  <span className="material-symbols-outlined text-sm">call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductCard({ product, hidePrice, isFirst, onOpenStore, inStorePage }) {
  const [showModal, setShowModal] = useState(false)
  const store = getStoreForProduct(product.id)

  return (
    <>
      <div className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group ${isFirst ? 'border-2 border-amber-400 outline outline-2 outline-amber-400 outline-offset-2' : 'border border-slate-100'}`}>
        <div className="relative h-40 pt-2 bg-white overflow-hidden flex items-center justify-center">
          <img
            alt={product.alt}
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
            src={product.image}
          />
          {isFirst && (
            <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow">
              Popular
            </span>
          )}
        </div>
        <div className="px-4 py-3 flex flex-col flex-1 items-center text-center">
          <h3 className="font-bold text-xs text-slate-900 leading-tight line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-slate-500 text-[10px] line-clamp-2 mb-2">{product.description}</p>
          <div className="mt-auto flex items-end justify-between w-full">
            {hidePrice ? (
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-primary hover:bg-primary-light text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all"
              >
                Solicitar
              </button>
            ) : (
              <>
                <div className="text-left">
                  {product.originalPrice && (
                    <p className="text-[8px] font-bold text-slate-400 line-through leading-none">
                      ${product.originalPrice.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                    </p>
                  )}
                  <p className="text-xs font-black text-primary leading-tight">
                    ${product.price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary/10 hover:bg-primary hover:text-white text-primary h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">visibility</span>
                  </button>
                  {store && !inStorePage && (
                    <button
                      onClick={() => onOpenStore && onOpenStore(store)}
                      className="bg-accent/20 hover:bg-accent hover:text-primary text-accent h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      title={store.name}
                    >
                      <span className="material-symbols-outlined text-sm font-bold">storefront</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ProductModal product={product} hidePrice={hidePrice} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
