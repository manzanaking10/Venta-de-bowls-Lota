import React, { useMemo, useState, useEffect } from "react";

function SectionCard({ title, subtitle, children, rightSlot }) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#58653d]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}

function ChoiceButton({ active, onClick, label, helper }) {
  return (
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
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm font-medium text-stone-700">
      {children}
    </span>
  );
}

function LogoMark() {
  return (
    <div className="relative inline-block">
      <div className="rounded-[30px] border-4 border-[#d8cfad] bg-[#58653d] px-6 py-5 text-[#f8f6ee] shadow-xl">
        <div className="text-4xl md:text-6xl font-black tracking-tight leading-none">
          La Receta
        </div>
        <div className="mt-3 inline-flex rounded-full bg-[#eadf9e] px-4 py-2 text-sm md:text-base font-bold text-[#58653d]">
          Bowls a tu gusto
        </div>
      </div>
      <div className="absolute -top-3 -left-3 text-2xl">🌿</div>
      <div className="absolute -top-4 right-2 text-2xl">🥬</div>
      <div className="absolute -bottom-2 -right-2 text-2xl">🥑</div>
    </div>
  );
}

function createEmptyCustomer() {
  return {
    nombre: "",
    telefono: "",
    direccion: "",
    comuna: "",
    notas: "",
  };
}

function createEmptyBowl() {
  return {
    base: "",
    protein: "",
    vegetables: [],
    sauces: [],
    extras: [],
    touches: [],
  };
}

export default function LaRecetaBowlsApp() {
  const WHATSAPP_NUMBER = "56940653522";

  const BANK_DETAILS = {
    titular: "Brandon Fernandez",
    banco: "Banco Estado",
    tipoCuenta: "Cuenta Rut (vista)",
    numeroCuenta: "19521650",
    rut: "19.521.650-9",
    correo: "pagoslarecetabowls@gmail.com",
  };

  const BOWL_PRICE = 5500;
  const SHRIMP_BOWL_PRICE = 7000;
  const EXTRA_PRICE = 500;
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
    "Salsa secreta",
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

  const [customer, setCustomer] = useState(createEmptyCustomer());
  const [currentBowl, setCurrentBowl] = useState(createEmptyBowl());
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [copiedTransfer, setCopiedTransfer] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const getBowlPrice = (protein, extrasSelected = []) => {
    const basePrice =
      protein === "Camarón ecuatoriano" ? SHRIMP_BOWL_PRICE : BOWL_PRICE;

    return basePrice + extrasSelected.length * EXTRA_PRICE;
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
        setError(
          `Puedes elegir máximo ${max} opciones en ${
            field === "vegetables"
              ? "vegetales"
              : field === "sauces"
              ? "salsas"
              : field === "touches"
              ? "toques"
              : "opciones"
          }.`
        );
        return prev;
      }

      return { ...prev, [field]: [...selected, value] };
    });
  };

  const validateBowl = (bowl) => {
    if (!bowl.base) return "Debes elegir 1 base.";
    if (!bowl.protein) return "Debes elegir 1 proteína.";
    if (bowl.vegetables.length > 5) return "Debes elegir máximo 5 vegetales.";
    if (bowl.sauces.length > 3) return "Debes elegir máximo 3 salsas.";
    if (bowl.touches.length > 3) return "Debes elegir máximo 3 toques.";
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
      price: getBowlPrice(currentBowl.protein, currentBowl.extras),
    };

    setCart((prev) => [...prev, item]);
    setCurrentBowl(createEmptyBowl());
    setSuccess("Bowl agregado al pedido.");
    setError("");
  };

  const removeFromCart = (id) => {
    clearMessages();
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const bowlPreviewPrice = getBowlPrice(currentBowl.protein, currentBowl.extras);

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
    `Total actual: $${total.toLocaleString("es-CL")}`,
  ].join("\n");

  const validateOrder = () => {
    if (!customer.nombre.trim()) return "Falta el nombre del cliente.";
    if (!customer.telefono.trim()) return "Falta el teléfono.";
    if (!customer.direccion.trim()) return "Falta la dirección.";
    if (!customer.comuna.trim()) return "Falta la comuna.";
    if (!cart.length) return "Debes agregar al menos 1 bowl al pedido.";
    if (!paymentMethod) return "Debes seleccionar un método de pago.";

    if (paymentMethod === "transferencia" && !receiptFile) {
      return "Debes subir la captura de transferencia antes de enviar.";
    }

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
      `Método de pago: ${
        paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"
      }`,
      "",
      "Pedido:",
    ];

    cart.forEach((item, index) => {
      lines.push(`Bowl ${index + 1} - $${item.price.toLocaleString("es-CL")}`);
      lines.push(`• Base: ${item.base}`);
      lines.push(`• Proteína: ${item.protein}`);
      lines.push(
        `• Vegetales: ${
          item.vegetables.length ? item.vegetables.join(", ") : "Sin vegetales"
        }`
      );
      lines.push(
        `• Salsas: ${item.sauces.length ? item.sauces.join(", ") : "Sin salsas"}`
      );
      lines.push(
        `• Extras: ${item.extras.length ? item.extras.join(", ") : "Sin extras"}`
      );
      lines.push(
        `• Toques: ${item.touches.length ? item.touches.join(", ") : "Sin toques"}`
      );
      lines.push("");
    });

    lines.push(
      `Despacho: ${
        DELIVERY_PRICE === 0 ? "Gratis" : `$${DELIVERY_PRICE.toLocaleString("es-CL")}`
      }`
    );
    lines.push(`Total: $${total.toLocaleString("es-CL")}`);
    lines.push("");

    if (paymentMethod === "efectivo") {
      lines.push("Pagaré en efectivo.");
    }

    if (paymentMethod === "transferencia") {
      lines.push("Pagaré por transferencia.");
      lines.push(`Comprobante cargado en la web: ${receiptFile?.name || "Sí"}`);
      lines.push("Adjuntaré la captura en este chat de WhatsApp.");
      lines.push("");
      lines.push("Datos de transferencia:");
      lines.push(`Titular: ${BANK_DETAILS.titular}`);
      lines.push(`Banco: ${BANK_DETAILS.banco}`);
      lines.push(`Tipo de cuenta: ${BANK_DETAILS.tipoCuenta}`);
      lines.push(`Número de cuenta: ${BANK_DETAILS.numeroCuenta}`);
      lines.push(`RUT: ${BANK_DETAILS.rut}`);
      lines.push(`Correo: ${BANK_DETAILS.correo}`);
    }

    return lines.join("\n");
  };

  const handlePaymentMethodChange = (method) => {
    clearMessages();
    setPaymentMethod(method);

    if (method !== "transferencia") {
      setPaymentOpen(false);
      setReceiptFile(null);

      if (receiptPreviewUrl) {
        URL.revokeObjectURL(receiptPreviewUrl);
      }
      setReceiptPreviewUrl("");
    }
  };

  const handleReceiptChange = (event) => {
    clearMessages();

    const file = event.target.files?.[0];

    if (!file) {
      setReceiptFile(null);
      if (receiptPreviewUrl) {
        URL.revokeObjectURL(receiptPreviewUrl);
      }
      setReceiptPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("La captura debe ser una imagen.");
      event.target.value = "";
      return;
    }

    setReceiptFile(file);

    if (receiptPreviewUrl) {
      URL.revokeObjectURL(receiptPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setReceiptPreviewUrl(objectUrl);
  };

  const sendOrder = () => {
    const validationError = validateOrder();
    if (validationError) {
      setError(validationError);
      return;
    }

    clearMessages();
    setIsSending(true);

    try {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        buildWhatsAppMessage()
      )}`;

      window.open(url, "_blank");

      if (paymentMethod === "efectivo") {
        setSuccess("Pedido enviado por WhatsApp.");
      } else {
        setSuccess(
          "Pedido enviado por WhatsApp. Ahora adjunta manualmente la captura en el chat."
        );
      }
    } catch (e) {
      setError(e.message || "Ocurrió un error al abrir WhatsApp.");
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
    setCurrentBowl(createEmptyBowl());
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowPopup(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) {
        URL.revokeObjectURL(receiptPreviewUrl);
      }
    };
  }, [receiptPreviewUrl]);

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
                Personaliza tus bowls, agrégalos al carrito y envía el pedido por
                WhatsApp.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Tag>Bowl normal $5.500</Tag>
                <Tag>Camarón ecuatoriano $7.000</Tag>
                <Tag>Extra +$500</Tag>
                <Tag>Despacho gratis</Tag>
              </div>
            </div>

            <div className="rounded-[32px] border border-stone-200 bg-white p-5 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-lime-50 p-4">
                  <div className="text-sm text-stone-500">Bowl actual</div>
                  <div className="mt-2 text-3xl font-black text-[#58653d]">
                    ${bowlPreviewPrice.toLocaleString("es-CL")}
                  </div>
                  <div className="mt-2 text-sm text-stone-600">
                    {currentBowl.protein === "Camarón ecuatoriano"
                      ? "Precio aplicado por camarón ecuatoriano."
                      : "Precio base del bowl normal."}
                    {currentBowl.extras.length > 0
                      ? ` + ${currentBowl.extras.length} extra(s)`
                      : ""}
                  </div>
                </div>

                <div className="rounded-3xl bg-stone-50 p-4">
                  <div className="text-sm text-stone-500">Pedido actual</div>
                  <div className="mt-2 text-3xl font-black text-[#58653d]">
                    ${total.toLocaleString("es-CL")}
                  </div>
                  <div className="mt-2 text-sm text-stone-600">
                    {cart.length} bowl(s) en el carrito
                  </div>
                </div>

                <div className="col-span-2 rounded-3xl bg-[#58653d] p-4 text-white">
                  <div className="font-black">Reglas del bowl</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-white/10 px-3 py-1">1 base</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">1 proteína</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Vegetales máx. 5
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Salsas máx. 3
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Toques máx. 3
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <SectionCard
            title="Datos del cliente"
            subtitle="Completa esto antes de enviar el pedido."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-stone-300 px-4 py-3"
                placeholder="Nombre"
                value={customer.nombre}
                onChange={(e) => updateCustomer("nombre", e.target.value)}
              />
              <input
                className="rounded-2xl border border-stone-300 px-4 py-3"
                placeholder="Teléfono"
                value={customer.telefono}
                onChange={(e) => updateCustomer("telefono", e.target.value)}
              />
              <input
                className="rounded-2xl border border-stone-300 px-4 py-3 md:col-span-2"
                placeholder="Dirección"
                value={customer.direccion}
                onChange={(e) => updateCustomer("direccion", e.target.value)}
              />
              <input
                className="rounded-2xl border border-stone-300 px-4 py-3"
                placeholder="Comuna"
                value={customer.comuna}
                onChange={(e) => updateCustomer("comuna", e.target.value)}
              />
              <input
                className="rounded-2xl border border-stone-300 px-4 py-3"
                placeholder="Notas (opcional)"
                value={customer.notas}
                onChange={(e) => updateCustomer("notas", e.target.value)}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Arma tu bowl"
            subtitle="Configura un bowl y agrégalo al carrito."
            rightSlot={
              <div className="rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-[#58653d]">
                Precio actual: ${bowlPreviewPrice.toLocaleString("es-CL")}
              </div>
            }
          >
            <div className="space-y-6">
              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Base</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bases.map((item) => (
                    <ChoiceButton
                      key={item}
                      label={item}
                      active={currentBowl.base === item}
                      onClick={() => {
                        clearMessages();
                        setCurrentBowl((prev) => ({ ...prev, base: item }));
                      }}
                    />
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
                      onClick={() => {
                        clearMessages();
                        setCurrentBowl((prev) => ({ ...prev, protein: item }));
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Vegetales</div>
                <div className="mb-2 text-sm text-stone-500">
                  Máximo 5. Puedes no elegir.
                </div>
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
                <div className="mt-3 text-sm text-stone-500">
                  Seleccionados: {currentBowl.vegetables.length}/5
                </div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Salsas</div>
                <div className="mb-2 text-sm text-stone-500">
                  Máximo 3. Puedes no elegir.
                </div>
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
                <div className="mt-3 text-sm text-stone-500">
                  Seleccionadas: {currentBowl.sauces.length}/3
                </div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Extras</div>
                <div className="mb-2 text-sm text-stone-500">
                  Cada extra suma ${EXTRA_PRICE.toLocaleString("es-CL")}.
                </div>
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
                <div className="mt-3 text-sm text-stone-500">
                  Seleccionados: {currentBowl.extras.length} ($
                  {(currentBowl.extras.length * EXTRA_PRICE).toLocaleString("es-CL")} CLP
                  extra)
                </div>
              </div>

              <div>
                <div className="mb-3 text-lg font-black text-[#58653d]">Toques</div>
                <div className="mb-2 text-sm text-stone-500">
                  Máximo 3. Puedes no elegir.
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {touches.map((item) => (
                    <ChoiceButton
                      key={item}
                      label={item}
                      active={currentBowl.touches.includes(item)}
                      onClick={() => toggleMulti("touches", item, 3)}
                    />
                  ))}
                </div>
                <div className="mt-3 text-sm text-stone-500">
                  Seleccionados: {currentBowl.touches.length}/3
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={addCurrentBowlToCart}
                  className="rounded-2xl bg-lime-500 px-5 py-4 font-black text-white"
                >
                  Agregar bowl al carrito
                </button>

                <button
                  onClick={resetBuilder}
                  className="rounded-2xl border border-stone-300 bg-white px-5 py-4 font-semibold text-stone-700"
                >
                  Limpiar selección
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-4 h-fit">
          <SectionCard title="Tu pedido" subtitle="Puedes seleccionar más de un bowl.">
            {!cart.length ? (
              <div className="rounded-2xl bg-stone-50 p-4 text-stone-500">
                Aún no has agregado bowls.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-black text-[#58653d]">
                          Bowl {index + 1}
                        </div>
                        <div className="mt-1 text-sm text-stone-600">
                          {item.base} • {item.protein}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-full border border-stone-300 px-3 py-1 text-sm font-semibold text-stone-700"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-stone-600">
                      <div>
                        <span className="font-semibold">Vegetales:</span>{" "}
                        {item.vegetables.length
                          ? item.vegetables.join(", ")
                          : "Sin vegetales"}
                      </div>
                      <div>
                        <span className="font-semibold">Salsas:</span>{" "}
                        {item.sauces.length ? item.sauces.join(", ") : "Sin salsas"}
                      </div>
                      <div>
                        <span className="font-semibold">Extras:</span>{" "}
                        {item.extras.length ? item.extras.join(", ") : "Sin extras"}
                      </div>
                      <div>
                        <span className="font-semibold">Toques:</span>{" "}
                        {item.touches.length ? item.touches.join(", ") : "Sin toques"}
                      </div>
                    </div>

                    <div className="mt-3 text-right text-lg font-black text-[#58653d]">
                      ${item.price.toLocaleString("es-CL")}
                    </div>
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
                <span>
                  {DELIVERY_PRICE === 0
                    ? "Gratis"
                    : `$${DELIVERY_PRICE.toLocaleString("es-CL")}`}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4 text-2xl font-black">
                <span>Total</span>
                <span>${total.toLocaleString("es-CL")}</span>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-stone-200 bg-white p-4">
              <div className="text-lg font-black text-[#58653d]">Método de pago</div>
              <div className="mt-3 grid gap-3">
                <ChoiceButton
                  label="Pago en efectivo"
                  helper="El pedido se envía de inmediato por WhatsApp."
                  active={paymentMethod === "efectivo"}
                  onClick={() => handlePaymentMethodChange("efectivo")}
                />

                <ChoiceButton
                  label="Pago por transferencia"
                  helper="Debes subir la captura antes de enviar."
                  active={paymentMethod === "transferencia"}
                  onClick={() => handlePaymentMethodChange("transferencia")}
                />
              </div>

              {paymentMethod === "transferencia" ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Sube la captura de transferencia
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptChange}
                      className="block w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
                    />
                    <p className="mt-2 text-xs text-stone-500">
                      La imagen no se adjunta sola a WhatsApp. El sistema valida que la
                      cargaste, abre el pedido y luego tú la envías manualmente en el chat.
                    </p>
                  </div>

                  {receiptFile ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-3">
                      <div className="text-sm font-semibold text-stone-800">
                        Archivo cargado: {receiptFile.name}
                      </div>

                      {receiptPreviewUrl ? (
                        <img
                          src={receiptPreviewUrl}
                          alt="Comprobante"
                          className="mt-3 max-h-56 w-full rounded-2xl object-contain border border-stone-200"
                        />
                      ) : null}
                    </div>
                  ) : null}

                  <button
                    onClick={() => setPaymentOpen(true)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 font-black text-stone-800"
                  >
                    Ver datos de transferencia
                  </button>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-800">
                {success}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3">
              <button
                onClick={sendOrder}
                disabled={isSending}
                className="rounded-2xl bg-lime-300 px-4 py-4 font-black text-stone-900 disabled:opacity-60"
              >
                {isSending
                  ? "Enviando..."
                  : paymentMethod === "efectivo"
                  ? "Enviar pedido por WhatsApp"
                  : paymentMethod === "transferencia"
                  ? "Enviar pedido + comprobante por WhatsApp"
                  : "Selecciona un método de pago"}
              </button>
            </div>
          </SectionCard>
        </aside>
      </main>

      {paymentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#58653d]">
                  Datos de transferencia
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Usa estos datos para pagar y luego sube la captura.
                </p>
              </div>
              <button
                onClick={() => setPaymentOpen(false)}
                className="rounded-full border border-stone-300 px-3 py-1 text-sm font-semibold text-stone-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-3xl bg-stone-50 p-5 text-stone-700">
              <div>
                <span className="font-semibold">Titular:</span> {BANK_DETAILS.titular}
              </div>
              <div>
                <span className="font-semibold">Banco:</span> {BANK_DETAILS.banco}
              </div>
              <div>
                <span className="font-semibold">Tipo de cuenta:</span>{" "}
                {BANK_DETAILS.tipoCuenta}
              </div>
              <div>
                <span className="font-semibold">Número de cuenta:</span>{" "}
                {BANK_DETAILS.numeroCuenta}
              </div>
              <div>
                <span className="font-semibold">RUT:</span> {BANK_DETAILS.rut}
              </div>
              <div>
                <span className="font-semibold">Correo:</span> {BANK_DETAILS.correo}
              </div>
              <div>
                <span className="font-semibold">Total actual:</span> $
                {total.toLocaleString("es-CL")}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={copyTransferData}
                className="rounded-2xl bg-[#58653d] px-4 py-4 font-black text-white"
              >
                {copiedTransfer ? "Datos copiados" : "Copiar datos"}
              </button>

              <button
                onClick={sendOrder}
                disabled={isSending}
                className="rounded-2xl bg-lime-300 px-4 py-4 font-black text-stone-900 disabled:opacity-60"
              >
                {isSending ? "Enviando..." : "Enviar pedido"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPopup && (
        <div
          style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}
          className="rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-[#58653d] shadow-xl"
        >
          Precio actual: ${bowlPreviewPrice.toLocaleString("es-CL")}
        </div>
      )}
    </div>
  );
}