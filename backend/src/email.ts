import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL || "Cortada Roo <onboarding@resend.dev>";

if (!apiKey) {
  throw new Error(
    "Falta la variable RESEND_API_KEY en el archivo .env del backend.",
  );
}

const resend = new Resend(apiKey);

export interface PaymentEmailData {
  guestName: string;
  guestEmail: string;
  reservationCode: string;

  apartmentName: string;

  checkIn: string;
  checkOut: string;

  guests: number;

  totalPrice: number;
}

export async function sendPaymentEmail(data: PaymentEmailData) {
  const deposit = data.totalPrice * 0.5;
  const remaining = data.totalPrice - deposit;

  const { data: responseData, error } = await resend.emails.send({
    from: fromEmail,
    to: data.guestEmail,
    subject: "✅ Reserva confirmada - Cortada Roo",

    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva confirmada</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#f3eee8;
    font-family:Arial,Helvetica,sans-serif;
    color:#302a26;
  "
>
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width:100%;
      background-color:#f3eee8;
      padding:32px 12px;
    "
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width:100%;
            max-width:650px;
            background-color:#ffffff;
            border-radius:22px;
            overflow:hidden;
            border:1px solid #e9dfd6;
            box-shadow:0 12px 35px rgba(71,52,37,0.12);
          "
        >

          <!-- Encabezado -->
          <tr>
            <td
              align="center"
              style="
                padding:36px 28px 32px;
                background-color:#8b6544;
              "
            >
              <div
                style="
                  display:inline-block;
                  margin-bottom:18px;
                  padding:8px 14px;
                  background-color:#ffffff;
                  border-radius:999px;
                  color:#8b6544;
                  font-size:12px;
                  font-weight:bold;
                  letter-spacing:1.5px;
                "
              >
                CORTADA ROO
              </div>

              <div
                style="
                  width:64px;
                  height:64px;
                  margin:0 auto 18px;
                  border-radius:50%;
                  background-color:#ffffff;
                  line-height:64px;
                  text-align:center;
                  font-size:30px;
                "
              >
                🎉
              </div>

              <h1
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:32px;
                  line-height:1.2;
                  font-weight:700;
                "
              >
                ¡Reserva confirmada!
              </h1>

              <p
                style="
                  margin:12px 0 0;
                  color:#f3e9df;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                Tu estadía en Cortada Roo ya está asegurada.
              </p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding:34px 34px 12px;">

              <h2
                style="
                  margin:0 0 12px;
                  color:#302a26;
                  font-size:24px;
                  line-height:1.3;
                "
              >
                ¡Hola, ${data.guestName}! 👋
              </h2>

              <p
                style="
                  margin:0;
                  color:#6f655e;
                  font-size:16px;
                  line-height:1.7;
                "
              >
                Recibimos correctamente el pago de tu seña y tu reserva quedó
                confirmada. A continuación encontrarás toda la información
                correspondiente a tu estadía.
              </p>

            </td>
          </tr>

          <!-- Confirmación de pago -->
          <tr>
            <td style="padding:18px 34px 8px;">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  background-color:#edf8f1;
                  border:1px solid #cce8d5;
                  border-radius:14px;
                "
              >
                <tr>
                  <td
                    width="52"
                    align="center"
                    valign="top"
                    style="
                      padding:19px 0 19px 18px;
                      font-size:24px;
                    "
                  >
                    ✅
                  </td>

                  <td style="padding:18px 18px 18px 10px;">
                    <p
                      style="
                        margin:0;
                        color:#277044;
                        font-size:16px;
                        line-height:1.5;
                        font-weight:bold;
                      "
                    >
                      Pago recibido correctamente
                    </p>

                    <p
                      style="
                        margin:5px 0 0;
                        color:#4e765c;
                        font-size:14px;
                        line-height:1.5;
                      "
                    >
                      La habitación quedó reservada a nombre de
                      ${data.guestName}.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Detalle de la reserva -->
          <tr>
            <td style="padding:26px 34px 10px;">

              <h3
                style="
                  margin:0 0 16px;
                  color:#8b6544;
                  font-size:19px;
                  line-height:1.3;
                "
              >
                🛏️ Detalle de la reserva
              </h3>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  border-collapse:separate;
                  border-spacing:0;
                  background-color:#faf8f5;
                  border:1px solid #ebe3db;
                  border-radius:14px;
                  overflow:hidden;
                "
              >

                <tr>
                  <td
                    style="
                      width:45%;
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#766b63;
                      font-size:14px;
                    "
                  >
                    🔖 Código de reserva
                  </td>

                  <td
                    style="
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#302a26;
                      font-size:15px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    ${data.reservationCode}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      width:45%;
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#766b63;
                      font-size:14px;
                    "
                  >
                    🏨 Habitación
                  </td>

                  <td
                    style="
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#302a26;
                      font-size:15px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    ${data.apartmentName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#766b63;
                      font-size:14px;
                    "
                  >
                    📅 Check-in
                  </td>

                  <td
                    style="
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#302a26;
                      font-size:15px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    ${data.checkIn}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#766b63;
                      font-size:14px;
                    "
                  >
                    📅 Check-out
                  </td>

                  <td
                    style="
                      padding:16px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#302a26;
                      font-size:15px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    ${data.checkOut}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:16px 18px;
                      color:#766b63;
                      font-size:14px;
                    "
                  >
                    👥 Huéspedes
                  </td>

                  <td
                    style="
                      padding:16px 18px;
                      color:#302a26;
                      font-size:15px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    ${data.guests}
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Pago -->
          <tr>
            <td style="padding:26px 34px 10px;">

              <h3
                style="
                  margin:0 0 16px;
                  color:#8b6544;
                  font-size:19px;
                  line-height:1.3;
                "
              >
                💳 Información del pago
              </h3>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  border-collapse:separate;
                  border-spacing:0;
                  background-color:#faf8f5;
                  border:1px solid #ebe3db;
                  border-radius:14px;
                  overflow:hidden;
                "
              >

                <tr>
                  <td
                    style="
                      padding:15px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#766b63;
                      font-size:14px;
                    "
                  >
                    Valor total
                  </td>

                  <td
                    style="
                      padding:15px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#302a26;
                      font-size:15px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    $${data.totalPrice.toLocaleString("es-AR")}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:15px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#277044;
                      font-size:14px;
                      font-weight:bold;
                    "
                  >
                    ✅ Seña recibida
                  </td>

                  <td
                    style="
                      padding:15px 18px;
                      border-bottom:1px solid #ebe3db;
                      color:#277044;
                      font-size:15px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    $${deposit.toLocaleString("es-AR")}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:17px 18px;
                      color:#8b6544;
                      font-size:15px;
                      font-weight:bold;
                    "
                  >
                    💰 Saldo pendiente
                  </td>

                  <td
                    style="
                      padding:17px 18px;
                      color:#8b6544;
                      font-size:18px;
                      font-weight:bold;
                      text-align:right;
                    "
                  >
                    $${remaining.toLocaleString("es-AR")}
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Aviso importante -->
          <tr>
            <td style="padding:24px 34px 8px;">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  background-color:#fff8e8;
                  border:1px solid #ead9aa;
                  border-radius:14px;
                "
              >
                <tr>
                  <td
                    width="50"
                    align="center"
                    valign="top"
                    style="
                      padding:18px 0 18px 16px;
                      font-size:22px;
                    "
                  >
                    📌
                  </td>

                  <td style="padding:17px 18px 17px 8px;">
                    <p
                      style="
                        margin:0 0 5px;
                        color:#765a27;
                        font-size:15px;
                        line-height:1.5;
                        font-weight:bold;
                      "
                    >
                      Conservá este correo
                    </p>

                    <p
                      style="
                        margin:0;
                        color:#846f48;
                        font-size:13px;
                        line-height:1.6;
                      "
                    >
                      Este mensaje funciona como comprobante de confirmación
                      de tu reserva y del pago de la seña.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Mensaje final -->
          <tr>
            <td style="padding:26px 34px 36px;">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  background-color:#8b6544;
                  border-radius:16px;
                "
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding:26px 20px;
                      color:#ffffff;
                    "
                  >
                    <p
                      style="
                        margin:0 0 8px;
                        font-size:21px;
                        font-weight:bold;
                        line-height:1.4;
                      "
                    >
                      ¡Te esperamos! ✨
                    </p>

                    <p
                      style="
                        margin:0;
                        color:#f4e9df;
                        font-size:14px;
                        line-height:1.7;
                      "
                    >
                      Muchas gracias por elegir Cortada Roo para tu estadía.
                      Será un placer recibirte.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding:25px 25px;
                background-color:#302a26;
              "
            >
              <p
                style="
                  margin:0 0 7px;
                  color:#ffffff;
                  font-size:16px;
                  font-weight:bold;
                "
              >
                Cortada Roo 🏡
              </p>

              <p
                style="
                  margin:0;
                  color:#cfc5bd;
                  font-size:12px;
                  line-height:1.6;
                "
              >
  📍 Cañada de Gómez, Santa Fe, Argentina
  <br>
  📞 +54 9 3471 31-6230
  <br>
  🌐 temporarioscortadaro.com
</p>

              <p
                style="
                  margin:11px 0 0;
                  color:#968a81;
                  font-size:11px;
                  line-height:1.5;
                "
>
  Este correo fue enviado automáticamente como comprobante de confirmación de tu reserva.
  <br><br>
  <strong>Por favor, no respondas este correo</strong>, ya que esta casilla no recibe mensajes.
  Si necesitás asistencia o querés modificar tu reserva, comunicate con nosotros por WhatsApp o a través de nuestro sitio web.
</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`,
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log(responseData);

  return responseData;
}
