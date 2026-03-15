import React, { useMemo, useState } from "react";

export default function LaRecetaBowlsApp() {

a  const WHATSAPP_NUMBER = "56940653522"; // 
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKPt6Yk_feFq7pZxN5GErFOGwZs97Z0o0BgGnsiAEs8cGOvaDU27N0Hal4O74V9z_W/exec"; 

  const BANK_DETAILS = {
    titular: "Brandon Fernandez",
    banco: "MACH",
    tipoCuenta: "Cuenta corriente",
    numeroCuenta: "777919521650",
    rut: "19.521.650-9",
    correo: "pagoslareceta@gmail.com",
  };

  const BOWL_PRICE = 5500;
  const SHRIMP_BOWL_PRICE = 7000;
  const DELIVERY_PRICE = 0;

  const bases = [
    "Arroz blanco",
    "Espirales",
    "Lechuga",
    "Fideos integrales",
    "Arroz integral",
  ];

  const proteins = [
    "Pollo teriyaki",
    "Atún",
    "Huevo duro",
    "Pollo cryspi",
    "Pollo a la plancha",
    "Camarón ecuatoriano",
  ];

  const vegetables = [
    "Lechuga",
    "Apio",
    "Repollo morado",
    "Pepino",
    "Zanahoria",
    "Tomate",
    "Palmito",
    "Brócoli",
    "Betarraga",
    "Choclo",
  ];

  const sauces = [
    "Salsa teriyaki",
    "Mayo sriracha",
    "Soya",
    "Salsa de ajo",
    "Acevichada",
    "Salsa verde",
    "Albahaca",
  ];

  const extras = [
    "Palta",
    "Tomate cherry",
    "Champiñón",
    "Crutones",
    "Aceitunas",
    "Queso crema",
  ];

  const touches = [
    "Sésamo negro",
    "Merkén",
    "Maní",
    "Orégano",
    "Cilantro",
    "Cebolla cryspi",
    "Papas hilo",
  ];

  const emptyCustomer = {
    nombre: "",
    telefono: "",
    direccion: "",
    comuna: "",
    notas: "",
  };

  const emptyBowl = {
    base: "",
    protein: "",
    vegetables: [],
    sauces: [],
    extras: [],
    touches: [],
  };

  const [customer, setCustomer] = useState(emptyCustomer);
  const [currentBowl, setCurrentBowl] = useState(emptyBowl);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [copiedTransfer, setCopiedTransfer] = useState(false);

  const getBowlPrice = (protein) =>
    protein === "Camarón ecuatoriano" ? SHRIMP_BOWL_PRICE : BOWL_PRICE;

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const updateCustomer = (field, value) => {
    clearMessages();
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMulti = (field, value, max) => {
    clearMessages();

    setCurrentBowl((prev) => {
      const selected = prev[field];
      const exists = selected.includes(value);

      if (exists) {
        return { ...prev, [field]: selected.filter((item) => item !== value) };
      }

      if (selected.length >= max) {
        setError(`Puedes elegir máximo ${max} opciones en ${field === "vegetables" ? "vegetales" : field === "sauces" ? "salsas" : "toques"}.`);
        return prev;
      }

      return { ...prev, [field]: [...selected, value] };
    });
  };

  const validateBowl = (bowl) => {
    if (!bowl.base) return "Debes elegir 1 base.";
    if (!bowl.protein) return "Debes elegir 1 proteína.";
    if (bowl.vegetables.length < 3) return "Debes elegir mínimo 3 vegetales.";
    if (bowl.vegetables.length > 5) return "Debes elegir máximo 5 vegetales.";
    if (bowl.sauces.length > 3) return "Debes elegir máximo 3 salsas.";
    if (bowl.touches.length !== 2) return "Debes elegir exactamente 2 toques.";
    return "";
  };

  const addCurrentBowlToCart = () => {
    const validationError = validateBowl(currentBowl);
    if (validationError) {
      setError(validationError);
      return;
    }

    const item = {
      id: Date.now(),
      ...currentBowl,
      price: getBowlPrice(currentBowl.protein),
    };

    setCart((prev) => [...prev, item]);
    setCurrentBowl(emptyBowl);
    setError("");
    setSuccess("Bowl agregado al pedido.");
  };

  const removeFromCart = (id) => {
    clearMessages();
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const bowlPreviewPrice = getBowlPrice(currentBowl.protein);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart]
  );

  const total = subtotal + DELIVERY_PRICE;

  const transferText = [
    "Datos de transferencia - La Receta",
    `Titular: ${BANK_DETAILS.titular}`,
    `Banco: ${BANK_DETAILS.banco}`,
    `Tipo de cuenta: ${BANK_DETAILS.tipoCuenta}`,
    `Número de cuenta: ${BANK_DETAILS.numeroCuenta}`,
    `RUT: ${BANK_DETAILS.rut}`,
    `Correo: ${BANK_DETAILS.correo}`,
  ].join("\n");

  const orderPayload = useMemo(() => {
    return {
      fecha: new Date().toISOString(),
      cliente: customer,
      bowls: cart.map((item, index) => ({
        numero: index + 1,
        base: item.base,
        proteina: item.protein,
        vegetales: item.vegetables.join(", "),
        salsas: item.sauces.join(", "),
        extras: item.extras.join(", "),
        toques: item.touches.join(", "),
        precio: item.price,
      })),
      despacho: DELIVERY_PRICE,
      total,
      estadoPago: "Pendiente por transferencia",
    };
  }, [customer, cart, total]);

  const validateOrder = () => {
    if (!customer.nombre.trim()) return "Falta el nombre del cliente.";
    if (!customer.telefono.trim()) return "Falta el teléfono.";
    if (!customer.direccion.trim()) return "Falta la dirección.";
    if (!customer.comuna.trim()) return "Falta la comuna.";
    if (!cart.length) return "Debes agregar al menos 1 bowl al pedido.";
    return "";
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      "Hola, quiero hacer un pedido en La Receta 🍲",
      "",
      `Nombre: ${customer.nombre}`,
      `Teléfono: ${customer.telefono}`,
      `Dirección: ${customer.direccion}`,
      `Comuna: ${customer.comuna}`,
      `Notas: ${customer.notas || "Sin notas"}`,
      "",
      "Pedido:",
    ];

    cart.forEach((item, index) => {
      lines.push(`Bowl ${index + 1} - $${item.price.toLocaleString("es-CL")}`);
      lines.push(`• Base: ${item.base}`);
      lines.push(`• Proteína: ${item.protein}`);
      lines.push(`• Vegetales: ${item.vegetables.join(", ")}`);
      lines.push(`• Salsas: ${item.sauces.length ? item.sauces.join(", ") : "Sin salsas"}`);
      lines.push(`• Extras: ${item.extras.length ? item.extras.join(", ") : "Sin extras"}`);
      lines.push(`• Toques: ${item.touches.join(", ")}`);
      lines.push("");
    });

    lines.push(`Despacho: ${DELIVERY_PRICE === 0 ? "Gratis" : `$${DELIVERY_PRICE.toLocaleString("es-CL")}`}`);
    lines.push(`Total: $${total.toLocaleString("es-CL")}`);
    lines.push("");
    lines.push("Pagaré por transferencia.");

    return lines.join("\n");
  };

  const saveOrderToGoogleSheets = async () => {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PEGA_AQUI")) {
      return { ok: false, skipped: true };
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      throw new Error("No se pudo guardar el pedido en Google Sheets.");
    }

    return { ok: true, skipped: false };
  };

  const sendOrder = async () => {
    const validationError = validateOrder();
    if (validationError) {
      setError(validationError);
      return;
    }

    clearMessages();
    setIsSending(true);

    try {
      const result = await saveOrderToGoogleSheets();
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
      window.open(url, "_blank");

      if (result.skipped) {
        setSuccess("Pedido listo. Se abrió WhatsApp, pero todavía debes conectar la URL de Google Apps Script para guardarlo en Google Sheets.");
      } else {
        setSuccess("Pedido enviado y guardado en Google Sheets.");
      }
    } catch (e) {
      setError(e.message || "Ocurrió un error al enviar el pedido.");
    } finally {
      setIsSending(false);
    }
  };

  const copyTransferData = async () => {
    try {
      await navigator.clipboard.writeText(transferText);
      setCopiedTransfer(true);
      setTimeout(() => setCopiedTransfer(false), 1800);
    } catch {
      setError("No se pudieron copiar los datos de transferencia.");
    }
  };

  const resetBuilder = () => {
    clearMessages();
    setCurrentBowl(emptyBowl);
  };

  const SectionCard = ({ title, subtitle, children, rightSlot }) => (
    <section className="rounded-[28px] border border-stone-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#58653d]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );

  const ChoiceButton = ({ active, onClick, label, helper }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
        active
          ? "border-lime-600 bg-lime-100 shadow-sm"
          : "border-stone-200 bg-stone-50 hover:bg-stone-100"
      }`}
    >
      <div className="font-semibold text-stone-800">{label}</div>
      {helper ? <div className="mt-1 text-xs text-stone-500">{helper}</div> : null}
    </button>
  );

  const Tag = ({ children }) => (
    <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm font-medium text-stone-700">
      {children}
    </span>
  );

  const LogoMark = () => (
    <div className="relative inline-block">
      <div className="rounded-[30px] border-4 border-[#d8cfad] bg-[#58653d] px-6 py-5 text-[#f8f6ee] shadow-xl">
        <div className="text-4xl md:text-6xl font-black tracking-tight leading-none">La Receta</div>
        <div className="mt-3 inline-flex rounded-full bg-[#eadf9e] px-4 py-2 text-sm md:text-base font-bold text-[#58653d]">
          Bowls a tu gusto
        </div>
      </div>
      <div className="absolute -top-3 -left-3 text-2xl">🌿</div>
      <div className="absolute -top-4 right-2 text-2xl">🥬</div>
      <div className="absolute -bottom-2 -right-2 text-2xl">🥑</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f3ea] text-stone-900">
      <header className="relative overflow-hidden border-b border-stone-200 bg-[#efede3]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-4 top-8 text-5xl">🥕</div>
          <div className="absolute right-8 top-10 text-5xl">🌽</div>
          <div className="absolute left-1/4 bottom-8 text-5xl">🥬</div>
          <div className="absolute right-1/4 bottom-10 text-5xl">🫑</div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <LogoMark />
              <p className="mt-6 max-w-xl text-lg text-stone-700">
                Personaliza tus bowls, agrégalos al carrito y recibe el pedido por WhatsApp. El pago queda listo por transferencia y los pedidos se pueden guardar en Google Sheets.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Tag>Bowl normal $5.500</Tag>
                <Tag>Camarón ecuatoriano $7.000</Tag>
                <Tag>Despacho gratis</Tag>
                <Tag>Reparto 12:00 pm a 03:00 pm</Tag>
              </div>
            </div>

            <div className="rounded-[32px] border border-stone-200 bg-white p-5 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-lime-50 p-4">
                  <div className="text-sm text-stone-500">Bowl actual</div>
                  <div className="mt-2 text-3xl font-black text-[#58653d]">${bowlPreviewPrice.toLocaleString("es-CL")}</div>
                  <div className="mt-2 text-sm text-stone-600">
                    {currentBowl.protein === "Camarón ecuatoriano"
                      ? "Precio aplicado por camarón ecuatoriano."
                      : "Precio base del bowl normal."}
                  </div>
                </div>
                <div className="rounded-3xl bg-orange-50 p-4">
                  <div className="text-sm text-stone-500">Pedido total</div>
                  <div className="mt-2 text-3xl font-black text-[#58653d]">${total.toLocaleString("es-CL")}</div>
                  <div className="mt-2 text-sm text-stone-600">{cart.length} bowl(s) en el carrito</div>
                </div>
                <div className="col-span-2 rounded-3xl bg-[#58653d] p-4 text-white">
                  <div className="font-black">Reglas del bowl</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-white/10 px-3 py-1">1 base</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">1 proteína</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">3 a 5 vegetales</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">Máx. 3 salsas</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">2 toques</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <SectionCard title="Datos del cliente" subtitle="Completa esto antes de enviar el pedido.">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-lime-300" placeholder="Nombre" value={customer.nombre} onChange={(e) => updateCustomer("nombre", e.target.value)} />
              <input className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-lime-300" placeholder="Teléfono" value={customer.telefono} onChange={(e) => updateCustomer("telefono", e.target.value)} />
              <input className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-lime-300 md:col-span-2" placeholder="Dirección" value={customer.direccion} onChange={(e) => updateCustomer("direccion", e.target.value)} />
              <input className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-lime-300" placeholder="Comuna" value={customer.comuna} onChange={(e) => updateCustomer("comuna", e.target.value)} />
              <input className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:ring-2 focus:ring-lime-300" placeholder="Notas (opcional)" value={customer.notas} onChange={(e) => updateCustomer("notas", e.target.value)} />
            </div>
          </SectionCard>

          <SectionCard title="Arma tu bowl" subtitle="Configura un bowl y agrégalo al carrito." rightSlot={<div className="rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-[#58653d]">Precio actual: ${bowlPreviewPrice.toLocaleString("es-CL")}</div>}>
            <div className="space-y-6">
              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Base</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bases.map((item) => (
                    <ChoiceButton key={item} label={item} active={currentBowl.base === item} onClick={() => { clearMessages(); setCurrentBowl((prev) => ({ ...prev, base: item })); }} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Proteína</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {proteins.map((item) => (
                    <ChoiceButton
                      key={item}
                      label={item}
                      helper={item === "Camarón ecuatoriano" ? "$7.000" : "$5.500"}
                      active={currentBowl.protein === item}
                      onClick={() => { clearMessages(); setCurrentBowl((prev) => ({ ...prev, protein: item })); }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Vegetales</div>
                <div className="mb-2 text-sm text-stone-500">Elige entre 3 y 5.</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {vegetables.map((item) => (
                    <ChoiceButton
                      key={item}
                      label={item}
                      active={currentBowl.vegetables.includes(item)}
                      onClick={() => toggleMulti("vegetables", item, 5)}
                    />
                  ))}
                </div>
                <div className="mt-3 text-sm text-stone-500">Seleccionados: {currentBowl.vegetables.length}/5</div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Salsas</div>
                <div className="mb-2 text-sm text-stone-500">Máximo 3.</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sauces.map((item) => (
                    <ChoiceButton
                      key={item}
                      label={item}
                      active={currentBowl.sauces.includes(item)}
                      onClick={() => toggleMulti("sauces", item, 3)}
                    />
                  ))}
                </div>
                <div className="mt-3 text-sm text-stone-500">Seleccionadas: {currentBowl.sauces.length}/3</div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Extras</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {extras.map((item) => (
                    <ChoiceButton
                      key={item}
                      label={item}
                      active={currentBowl.extras.includes(item)}
                      onClick={() => {
                        clearMessages();
                        setCurrentBowl((prev) => ({
                          ...prev,
                          extras: prev.extras.includes(item)
                            ? prev.extras.filter((x) => x !== item)
                            : [...prev.extras, item],
                        }));
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Toques</div>
                <div className="mb-2 text-sm text-stone-500">Debes elegir exactamente 2.</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {touches.map((item) => (
                    <ChoiceButton
                      key={item}
                      label={item}
                      active={currentBowl.touches.includes(item)}
                      onClick={() => toggleMulti("touches", item, 2)}
                    />
                  ))}
                </div>
                <div className="mt-3 text-sm text-stone-500">Seleccionados: {currentBowl.touches.length}/2</div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={addCurrentBowlToCart} className="rounded-2xl bg-[#58653d] px-5 py-4 font-black text-white transition hover:opacity-90">
                  Agregar bowl al carrito
                </button>
                <button onClick={resetBuilder} className="rounded-2xl border border-stone-300 bg-white px-5 py-4 font-semibold text-stone-700 transition hover:bg-stone-50">
                  Limpiar selección
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-4 h-fit">
          <SectionCard title="Tu pedido" subtitle="Puedes seleccionar más de un bowl.">
            {!cart.length ? (
              <div className="rounded-2xl bg-stone-50 p-4 text-stone-500">Aún no has agregado bowls.</div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-[#58653d]">Bowl {index + 1}</div>
                        <div className="mt-1 text-sm text-stone-600">{item.base} • {item.protein}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="rounded-full border border-stone-300 px-3 py-1 text-sm font-semibold text-stone-700 hover:bg-white">
                        Quitar
                      </button>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-stone-600">
                      <div><span className="font-semibold">Vegetales:</span> {item.vegetables.join(", ")}</div>
                      <div><span className="font-semibold">Salsas:</span> {item.sauces.length ? item.sauces.join(", ") : "Sin salsas"}</div>
                      <div><span className="font-semibold">Extras:</span> {item.extras.length ? item.extras.join(", ") : "Sin extras"}</div>
                      <div><span className="font-semibold">Toques:</span> {item.touches.join(", ")}</div>
                    </div>
                    <div className="mt-3 text-right text-lg font-black text-[#58653d]">${item.price.toLocaleString("es-CL")}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-3xl bg-[#58653d] p-5 text-white">
              <div className="flex items-center justify-between text-sm opacity-90">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-CL")}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm opacity-90">
                <span>Despacho</span>
                <span>{DELIVERY_PRICE === 0 ? "Gratis" : `$${DELIVERY_PRICE.toLocaleString("es-CL")}`}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4 text-2xl font-black">
                <span>Total</span>
                <span>${total.toLocaleString("es-CL")}</span>
              </div>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="mt-4 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-800">{success}</div> : null}

            <div className="mt-5 grid gap-3">
              <button onClick={() => setPaymentOpen(true)} className="rounded-2xl border border-stone-300 bg-white px-4 py-4 font-black text-stone-800 transition hover:bg-stone-50">
                Ver datos de transferencia
              </button>
              <button onClick={sendOrder} disabled={isSending} className="rounded-2xl bg-lime-300 px-4 py-4 font-black text-stone-900 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60">
                {isSending ? "Enviando..." : "Guardar pedido + enviar por WhatsApp"}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Google Sheets" subtitle="La integración ya está preparada.">
            <div className="space-y-3 text-sm text-stone-600">
              <p>
                Para que los pedidos queden guardados en Google Sheets, pega la URL pública de tu Web App de Google Apps Script en la constante <span className="font-bold">GOOGLE_SCRIPT_URL</span>.
              </p>
              <p>
                También debes reemplazar los datos bancarios en <span className="font-bold">BANK_DETAILS</span> y tu número real en <span className="font-bold">WHATSAPP_NUMBER</span>.
              </p>
            </div>
          </SectionCard>
        </aside>
      </main>

      {paymentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#58653d]">Datos de transferencia</h3>
                <p className="mt-1 text-sm text-stone-500">Configura estos datos con tu cuenta real.</p>
              </div>
              <button onClick={() => setPaymentOpen(false)} className="rounded-full border border-stone-300 px-3 py-1 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                Cerrar
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-3xl bg-stone-50 p-5 text-stone-700">
              <div><span className="font-semibold">Titular:</span> {BANK_DETAILS.titular}</div>
              <div><span className="font-semibold">Banco:</span> {BANK_DETAILS.banco}</div>
              <div><span className="font-semibold">Tipo de cuenta:</span> {BANK_DETAILS.tipoCuenta}</div>
              <div><span className="font-semibold">Número de cuenta:</span> {BANK_DETAILS.numeroCuenta}</div>
              <div><span className="font-semibold">RUT:</span> {BANK_DETAILS.rut}</div>
              <div><span className="font-semibold">Correo:</span> {BANK_DETAILS.correo}</div>
              <div><span className="font-semibold">Total actual:</span> ${total.toLocaleString("es-CL")}</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={copyTransferData} className="rounded-2xl bg-[#58653d] px-4 py-4 font-black text-white transition hover:opacity-90">
                {copiedTransfer ? "Datos copiados" : "Copiar datos"}
              </button>
              <button onClick={sendOrder} disabled={isSending} className="rounded-2xl bg-lime-300 px-4 py-4 font-black text-stone-900 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60">
                {isSending ? "Enviando..." : "Pagar y enviar pedido"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
