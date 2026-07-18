import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ManualReservationModal from "../components/ManualReservationModal";

const NewReservation = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleCreated = async () => {
    await navigate("/admin/reservas");
  };

  return (
    <>
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f2e8dc] text-[#8d633d]">
              <FilePlus2 size={22} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57b52]">
                Gestión
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-neutral-950">
                Nueva reserva
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Registrá una reserva interna con los mismos datos que se piden
                en la web para dejarla asentada desde recepción.
              </p>
            </div>
          </div>

          {!showModal && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#9b6f45] px-5 text-sm font-semibold text-white transition hover:bg-[#845b39]"
            >
              Abrir formulario
            </button>
          )}
        </div>
      </section>

      {showModal && (
        <ManualReservationModal
          onClose={handleClose}
          onCreated={handleCreated}
        />
      )}
    </>
  );
};

export default NewReservation;
