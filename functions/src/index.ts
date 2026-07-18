import {setGlobalOptions} from "firebase-functions";

// Este proyecto no publica Functions por ahora: el backend de Resend se
// mantiene en /backend y se despliega como servicio independiente.
setGlobalOptions({maxInstances: 10});
